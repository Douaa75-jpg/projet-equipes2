import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Pointage, PointageType } from '@prisma/client';
import moment from 'moment-timezone';

@Injectable()
export class PointageService {
  private readonly logger = new Logger(PointageService.name);
  private readonly timezone = 'Africa/Tunis'; // Fuseau horaire Tunisie (UTC+1)

  constructor(private prisma: PrismaService) {}

  async enregistrerPointage(employeId: string) {
    // 1. Capturer l'heure locale exacte
    const maintenantLocale = moment().tz(this.timezone);
    const heureLocaleFormattee = maintenantLocale.format('YYYY-MM-DD HH:mm:ss');
    
    // 2. Pour le stockage, utiliser l'heure locale SANS conversion UTC
    const aujourdhui = maintenantLocale.clone().startOf('day');
    
    // Logs de vérification
    this.logger.debug(`Heure Tunisie: ${heureLocaleFormattee}`);
    this.logger.debug(`Date stockée: ${aujourdhui.format('YYYY-MM-DD')}`);
  
    const dernierPointage = await this.prisma.pointage.findFirst({
      where: {
        employeId,
        date: {
          gte: aujourdhui.toDate(),
          lte: aujourdhui.clone().endOf('day').toDate()
        }
      },
      orderBy: { heure: 'desc' },
    });
  
    const type: PointageType = !dernierPointage || dernierPointage.type === 'SORTIE' 
      ? 'ENTREE' 
      : 'SORTIE';
  
    // Stockage DIRECT de l'heure locale
    await this.prisma.pointage.create({
      data: {
        employeId,
        date: aujourdhui.toDate(),
        heure: maintenantLocale.toDate(), // Stocke l'heure locale telle quelle
        type
      }
    });
    // Mise à jour automatique des heures travaillées
    await this.updateDailyHours(employeId, aujourdhui.format('YYYY-MM-DD'));
  
    return { 
      message: `Pointage ${type === 'ENTREE' ? 'd\'arrivée' : 'de départ'} enregistré`,
      type,
      heureLocale: heureLocaleFormattee
    };
  }

  // Calculer les heures travaillées dans la journée

async calculerHeuresTravail(employeId: string, dateDebut: string, dateFin: string) {
  const debut = moment.tz(dateDebut, this.timezone).startOf('day');
    const fin = moment.tz(dateFin, this.timezone).endOf('day');

    const pointages = await this.prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: debut.toDate(),
          lte: fin.toDate()
        }
      },
      orderBy: { heure: 'asc' }
    });

    let totalHeures = 0;
    let entreePrecedente: Date | null = null;

    for (const pointage of pointages) {
      const heurePointage = moment(pointage.heure).tz(this.timezone);
      if (pointage.type === 'ENTREE') {
        entreePrecedente = heurePointage.toDate();
      } else if (pointage.type === 'SORTIE' && entreePrecedente) {
        const heureSortie = heurePointage;
        const dureeHeures = heureSortie.diff(moment(entreePrecedente).tz(this.timezone), 'hours', true);
        totalHeures += dureeHeures;
        entreePrecedente = null;
      }
    }

    return { 
      totalHeures,
      totalHeuresFormatted: `${Math.floor(totalHeures)}h ${Math.round((totalHeures % 1) * 60)}min`
    };
  }

  async getHistorique(employeId: string, date: string) {
    // Vérifier que l'employé existe
    const employeExiste = await this.prisma.employe.findUnique({
      where: { id: employeId }
    });
  
    if (!employeExiste) {
      return []; // Retourne une liste vide au lieu de throw
    }
  
    // Traitement de la date avec le fuseau horaire
    const dateDebut = moment.tz(date, 'Africa/Tunis').startOf('day');
    const dateFin = dateDebut.clone().endOf('day');
  
    const pointages = await this.prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: dateDebut.toDate(),
          lte: dateFin.toDate()
        }
      },
      orderBy: { heure: 'asc' },
      select: {
        id: true,
        type: true,
        heure: true,
        date: true,
        employe: {
          select: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                matricule: true
              }
            }
          }
        }
      }
    });
  
    // Conversion des heures en format local Tunis
    return pointages.map(p => ({
      id: p.id,
      type: p.type,
      typeLibelle: p.type === 'ENTREE' ? 'Arrivée' : 'Départ',
      date: moment(p.date).tz('Africa/Tunis').format('YYYY-MM-DD'),
      heure: moment(p.heure).tz('Africa/Tunis').format('HH:mm:ss'),
      employe: {
        nom: p.employe.utilisateur.nom,
        prenom: p.employe.utilisateur.prenom,
        matricule: p.employe.utilisateur.matricule
      }
    }));
  }

  async updateDailyHours(employeId: string, date: string) {
    const { totalHeures } = await this.calculerHeuresTravail(employeId, date, date);
    await this.prisma.employe.update({
      where: { id: employeId },
      data: { heuresTravail: totalHeures }
    });
  }

  // دالة لاسترجاع ساعات الفريق للشيف
  async getHeuresEquipe(chefId: string) {
    const equipe = await this.prisma.employe.findMany({
      where: { responsableId: chefId },
      select: {
        id: true,
        utilisateur: {
          select: {
            nom: true,
            prenom: true,
            email:true,
            matricule: true
          }
        },
        heuresTravail: true,
        nbAbsences: true,    // Ajout de ce champ
        soldeConges: true, 
        heuresSupp:true
      }
    });

    return equipe.map(emp => ({
    ...emp,
    heuresTravailFormatted: this.formatHeures(emp.heuresTravail || 0),
    nbAbsences: emp.nbAbsences || 0,       // Retourne 0 si null
    soldeConges: emp.soldeConges || 0      // Retourne 0 si null
  }));
}

  private formatHeures(heures: number): string {
    return `${Math.floor(heures)}h ${Math.round((heures % 1) * 60)}min`;
  }

  async getHeuresJournalieres(employeId: string, date: string) {
    return this.calculerHeuresTravail(employeId, date, date);
  }
  async getEmployesList() {
    return this.prisma.employe.findMany();
  }



  async getHeuresTravailTousLesEmployes(chefId: string, dateDebut?: string, dateFin?: string) {
    const equipe = await this.prisma.employe.findMany({
      where: { responsableId: chefId },
      select: {
        id: true,
        utilisateur: {
          select: {
            nom: true,
            prenom: true,
            matricule: true,
            email:true,
            datedenaissance:true,
          }
        }
      }
    });

    const debut = dateDebut 
      ? moment.tz(dateDebut, this.timezone).startOf('day') 
      : moment.tz(this.timezone).startOf('month');
    
    const fin = dateFin 
      ? moment.tz(dateFin, this.timezone).endOf('day') 
      : moment.tz(this.timezone).endOf('month');

    const resultats = await Promise.all(
      equipe.map(async (employe) => {
        const pointages = await this.prisma.pointage.findMany({
          where: {
            employeId: employe.id,
            date: { gte: debut.toDate(), lte: fin.toDate() }
          },
          orderBy: { heure: 'asc' },
        });

        const heuresParJour: Record<string, number> = {};
        let entreePrecedente: Date | null = null;

        pointages.forEach((pointage) => {
          const dateJour = moment(pointage.date).format('YYYY-MM-DD');
          
          if (pointage.type === 'ENTREE') {
            entreePrecedente = pointage.heure;
          } else if (pointage.type === 'SORTIE' && entreePrecedente) {
            const dureeHeures = moment(pointage.heure).diff(
              moment(entreePrecedente),
              'hours',
              true
            );
            
            heuresParJour[dateJour] = (heuresParJour[dateJour] || 0) + dureeHeures;
            entreePrecedente = null;
          }
        });

        return {
          employe: {
            id: employe.id,
            nom: employe.utilisateur.nom,
            prenom: employe.utilisateur.prenom,
            matricule: employe.utilisateur.matricule,
            email:employe.utilisateur.email,
            datedenaissance:employe.utilisateur.datedenaissance
          },
          heuresParJour,
          totalHeures: Object.values(heuresParJour).reduce((sum, heures) => sum + heures, 0)
        };
      })
    );

    return {
      periode: {
        debut: debut.format('YYYY-MM-DD'),
        fin: fin.format('YYYY-MM-DD')
      },
      employes: resultats
    };
  }



  //pour recupere l'historique de pointage pour  chef d'equipe
  async getHistoriqueEquipe(chefId: string, options: {
    dateDebut?: string;
    dateFin?: string;
    page?: number;
    limit?: number;
    type?: PointageType;
    employeId?: string; // تصفية حسب موظف معين
  }) {
    // 1. جلب قائمة الموظفين تحت مسؤولية هذا الشيف
    const equipe = await this.prisma.employe.findMany({
      where: { responsableId: chefId },
      select: { id: true }
    });
  
    if (equipe.length === 0) {
      return {
        items: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
        periode: { debut: options.dateDebut, fin: options.dateFin }
      };
    }
  
    // 2. تحضير التواريخ (باستخدام التوقيت المحلي لتونس)
    const dateDebut = options.dateDebut
      ? moment.tz(options.dateDebut, this.timezone).startOf('day')
      : moment.tz(this.timezone).subtract(30, 'days').startOf('day');
  
    const dateFin = options.dateFin
      ? moment.tz(options.dateFin, this.timezone).endOf('day')
      : moment.tz(this.timezone).endOf('day');
  
    // 3. إعداد الباجينيشين (Pagination)
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
  
    // 4. بناء فلتر البحث
    const where: any = {
      employeId: { in: equipe.map(e => e.id) }, // فقط موظفي الفريق
      date: {
        gte: dateDebut.toDate(),
        lte: dateFin.toDate()
      }
    };
  
    if (options.type) {
      where.type = options.type;
    }
  
    if (options.employeId) {
      where.employeId = options.employeId; // تصفية إضافية حسب موظف معين
    }
  
    // 5. جلب البيانات مع JOIN لمعلومات الموظف
    const [pointages, total] = await Promise.all([
      this.prisma.pointage.findMany({
        where,
        orderBy: { heure: 'desc' },
        skip,
        take: limit,
        include: {
          employe: {
            include: {
              utilisateur: {
                select: {
                  nom: true,
                  prenom: true,
                  matricule: true
                }
              }
            }
          }
        }
      }),
      this.prisma.pointage.count({ where })
    ]);
  
    // 6. تنسيق البيانات للإرجاع
    const items = pointages.map(p => ({
      id: p.id,
      type: p.type,
      typeLibelle: p.type === 'ENTREE' ? 'Arrivée' : 'Départ',
      date: moment(p.date).tz(this.timezone).format('YYYY-MM-DD'),
      heure: moment(p.heure).tz(this.timezone).format('HH:mm:ss'),
      employe: {
        id: p.employeId,
        nom: p.employe.utilisateur.nom,
        prenom: p.employe.utilisateur.prenom,
        matricule: p.employe.utilisateur.matricule
      }
    }));
  
    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1
      },
      periode: {
        debut: dateDebut.format('YYYY-MM-DD'),
        fin: dateFin.format('YYYY-MM-DD')
      }
    };
  }


//pour recupere l'historique de pointage pour rh
  async getHistoriqueRH(options: {
  dateDebut?: string;
  dateFin?: string;
  page?: number;
  limit?: number;
  type?: 'ENTREE' | 'SORTIE';
  employeId?: string;
  departementId?: string;
  searchTerm?: string; // Nouveau: recherche par nom/prénom/matricule
}) {
  // 1. Configuration des dates (fuseau horaire Tunis)
  const dateDebut = options.dateDebut
    ? moment.tz(options.dateDebut, 'Africa/Tunis').startOf('day')
    : moment.tz('Africa/Tunis').subtract(30, 'days').startOf('day');

  const dateFin = options.dateFin
    ? moment.tz(options.dateFin, 'Africa/Tunis').endOf('day')
    : moment.tz('Africa/Tunis').endOf('day');

  // 2. Configuration de la pagination
  const page = options.page || 1;
  const limit = options.limit || 25;
  const skip = (page - 1) * limit;

  // 3. Construction du filtre de base
  const where: any = {
    date: {
      gte: dateDebut.toDate(),
      lte: dateFin.toDate()
    }
  };

  // 4. Filtres optionnels
  if (options.type) {
    where.type = options.type;
  }

  if (options.employeId) {
    where.employeId = options.employeId;
  }

  if (options.departementId) {
    where.employe = { departementId: options.departementId };
  }

  // 5. Filtre de recherche (nom, prénom ou matricule)
  if (options.searchTerm) {
    where.employe = {
      ...where.employe,
      utilisateur: {
        OR: [
          { nom: { contains: options.searchTerm, mode: 'insensitive' } },
          { prenom: { contains: options.searchTerm, mode: 'insensitive' } },
          { matricule: { contains: options.searchTerm, mode: 'insensitive' } }
        ]
      }
    };
  }

  // 6. Récupération des données avec jointures
  const [pointages, total] = await Promise.all([
    this.prisma.pointage.findMany({
      where,
      orderBy: { heure: 'desc' },
      skip,
      take: limit,
      include: {
        employe: {
          include: {
            utilisateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                matricule: true,
                email: true
              }
            },
          }
        }
      }
    }),
    this.prisma.pointage.count({ where })
  ]);

  // 7. Formatage des résultats
  const items = pointages.map(p => ({
    id: p.id,
    type: p.type,
    typeLibelle: p.type === 'ENTREE' ? 'Entrée' : 'Sortie',
    date: moment(p.date).tz('Africa/Tunis').format('YYYY-MM-DD'),
    heure: moment(p.heure).tz('Africa/Tunis').format('HH:mm:ss'),
    employe: {
      id: p.employe.id,
      nom: p.employe.utilisateur.nom,
      prenom: p.employe.utilisateur.prenom,
      matricule: p.employe.utilisateur.matricule,
      email: p.employe.utilisateur.email,
    },
    rawDate: p.date // Pour le tri côté client
  }));

  // 8. Retour des résultats structurés
  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1
    },
    periode: {
      debut: dateDebut.format('YYYY-MM-DD'),
      fin: dateFin.format('YYYY-MM-DD')
    }
  };
}




  async getEmployeInfo(employeId: string) {
    const employe = await this.prisma.employe.findUnique({
      where: { id: employeId },
      include: {
        utilisateur: {
          select: {
            nom: true,
            prenom: true,
            email: true,
            matricule: true,
            datedenaissance: true,
          }
        },
        responsable: {
          select: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        }
      }
    });
  
    if (!employe) {
      throw new NotFoundException('Employé non trouvé');
    }
  
    return {
      id: employe.id,
      nom: employe.utilisateur.nom,
      prenom: employe.utilisateur.prenom,
      email: employe.utilisateur.email,
      matricule: employe.utilisateur.matricule,
      datedenaissance: employe.utilisateur.datedenaissance,
      responsable: employe.responsable 
        ? `${employe.responsable.utilisateur.prenom} ${employe.responsable.utilisateur.nom}`
        : 'Non assigné'
    };
  }

  async countEmployesSousChef(chefId: string): Promise<number> {
    return this.prisma.employe.count({
      where: {
        responsableId: chefId,
      },
    });
  }


  // Dans pointage.service.ts

  async getWeeklyHoursChartData(employeId: string, dateDebut: string) {
    const startDate = moment.tz(dateDebut, this.timezone).startOf('week'); // Lundi
    const endDate = startDate.clone().endOf('week'); // Dimanche
  
    const days: string[] = [];
    const hours: number[] = [];
  
    for (let day = startDate.clone(); day <= endDate; day.add(1, 'day')) {
      const dayOfWeek = day.day(); // 0 = dimanche, 6 = samedi
  
      // Exclure samedi (6) et dimanche (0)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const dateStr = day.format('YYYY-MM-DD');
        const { totalHeures } = await this.calculerHeuresTravail(employeId, dateStr, dateStr);
  
        days.push(day.format('dddd')); // Nom du jour (Lundi, Mardi...)
        hours.push(Number(totalHeures.toFixed(2)));
      }
    }
  
    return {
      labels: days,
      datasets: [{
        label: 'Heures travaillées',
        data: hours,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  }
  


// Dans pointage.service.ts












async getAttendanceDistribution(employeId: string, dateDebut?: string, dateFin?: string) {
  const employe = await this.prisma.employe.findUnique({
    where: { id: employeId },
    include: {
      utilisateur: {
        select: { dateEmbauche: true }
      }
    }
  });

  if (!employe || !employe.utilisateur?.dateEmbauche) {
    throw new NotFoundException("Employé introuvable ou date d'embauche manquante.");
  }

  const hireDate = moment(employe.utilisateur.dateEmbauche).tz(this.timezone).startOf('day');
  const startDate = moment.tz(dateDebut || hireDate, this.timezone).startOf('day');
  const endDate = moment.tz(dateFin || moment(), this.timezone).endOf('day');

  if (hireDate.isAfter(endDate)) {
    return {
      periode: {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      },
      message: "L'employé n'était pas encore en poste durant cette période.",
      labels: ['Présent', 'Retard', 'Absent'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(255, 99, 132, 0.5)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }],
      rawData: {
        present: 0,
        retard: 0,
        absent: 0,
        joursOuvresTotal: 0
      }
    };
  }

  const adjustedStartDate = hireDate.isAfter(startDate) ? hireDate : startDate;

  // Get all ENTREE pointages in a single query
  const allPointages = await this.prisma.pointage.findMany({
    where: {
      employeId,
      type: 'ENTREE',
      date: {
        gte: adjustedStartDate.toDate(),
        lte: endDate.toDate()
      }
    },
    orderBy: { date: 'asc' }
  });

  let present = 0;
  let retard = 0;
  let absent = 0;

  for (let day = adjustedStartDate.clone(); day.isSameOrBefore(endDate); day.add(1, 'day')) {
    // Skip weekends
    if (day.day() === 0 || day.day() === 6) continue;

    const pointagesJour = allPointages.filter(p => {
      return moment(p.date).tz(this.timezone).isSame(day, 'day');
    });

    if (pointagesJour.length === 0) {
      absent++;
    } else {
      // Take the first entry
      const premiereEntree = pointagesJour[0];
      const heureEntree = moment(premiereEntree.heure).tz(this.timezone);
      const heureLimite = day.clone().set({ hour: 9, minute: 15 });

      if (heureEntree.isAfter(heureLimite)) {
        retard++;
      } else {
        present++;
      }
    }
  }

  const joursOuvresTotal = present + retard + absent;
  const pourcentagePresent = joursOuvresTotal > 0 ? (present / joursOuvresTotal) * 100 : 0;
  const pourcentageRetard = joursOuvresTotal > 0 ? (retard / joursOuvresTotal) * 100 : 0;
  const pourcentageAbsent = joursOuvresTotal > 0 ? (absent / joursOuvresTotal) * 100 : 0;

  return {
    periode: {
      startDate: adjustedStartDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD')
    },
    labels: ['Présent', 'Retard', 'Absent'],
    datasets: [{
      data: [pourcentagePresent, pourcentageRetard, pourcentageAbsent],
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(255, 99, 132, 0.5)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }],
    rawData: {
      present,
      retard,
      absent,
      joursOuvresTotal
    }
  };
}
























// Nouvelle méthode pour les présences
async getNombreEmployesPresentAujourdhui(employeId?: string) {
  const aujourdhui = moment().tz(this.timezone).startOf('day');
  
  // Si employeId est fourni, on vérifie juste pour cet employé
  if (employeId) {
    const pointages = await this.prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: aujourdhui.toDate(),
          lte: aujourdhui.clone().endOf('day').toDate()
        },
        type: 'ENTREE'
      }
    });
    return pointages.length > 0 ? 1 : 0;
  }

  // Sinon, on compte tous les employés présents
  const employesPresents = await this.prisma.pointage.findMany({
    where: {
      date: {
        gte: aujourdhui.toDate(),
        lte: aujourdhui.clone().endOf('day').toDate()
      },
      type: 'ENTREE'
    },
    distinct: ['employeId']
  });

  return employesPresents.length;
}




async getPresenceByWeekdayForAllEmployees(dateDebut: string, dateFin: string) {
  const startDate = moment.tz(dateDebut, this.timezone).startOf('day');
  const endDate = moment.tz(dateFin, this.timezone).endOf('day');

  // 1. Récupérer tous les employés et leurs pointages
  const tousLesEmployes = await this.prisma.employe.findMany({
    include: {
      utilisateur: {
        select: {
          nom: true,
          prenom: true
        }
      }
    }
  });
  const nombreEmployes = tousLesEmployes.length;
  // 2. Initialiser les stats par jour
  const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi' , 'Samedi'];
  const stats = {
    presence: Array(6).fill(0),    // Nombre de présences par jour
    totalPossible: Array(6).fill(nombreEmployes) // Nombre total de jours ouvrables par jour
  };

  // 3. Pour chaque employé, analyser chaque jour de la période
  for (const employe of tousLesEmployes) {
    const pointages = await this.prisma.pointage.findMany({
      where: {
        employeId: employe.id,
        date: { gte: startDate.toDate(), lte: endDate.toDate() }
      },
      orderBy: { heure: 'asc' }
    });

     // Créer un Set des jours où l'employé a pointé
     const joursPresents = new Set(
      pointages
        .filter(p => p.type === 'ENTREE')
        .map(p => moment(p.date).day() - 1) // Lundi=0, ..., Samedi=5
    );

    // Mettre à jour les stats pour chaque jour présent
    joursPresents.forEach(jour => {
      if (jour >= 0 && jour <= 5) {
        stats.presence[jour]++;
      }
    });
  }

  // 4. Calculer les taux de présence globaux
  const tauxPresence = joursSemaine.map((jour, index) => {
    return stats.totalPossible[index] > 0 
      ? Math.round((stats.presence[index] / stats.totalPossible[index]) * 100)
      : 0;
  });

  return {
    labels: joursSemaine,
    datasets: [{
      label: 'Taux de présence global',
      data: tauxPresence,
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }],
    rawData: {
      presence: stats.presence,
      totalPossible: stats.totalPossible
    }
  };
}

async getPresencesSousChefAujourdhui(chefId: string) {
  const aujourdhui = moment().tz(this.timezone).startOf('day');
  
  // 1. Récupérer tous les employés sous ce chef
  const employes = await this.prisma.employe.findMany({
    where: { responsableId: chefId },
    select: { id: true }
  });

  const totalEmployes = employes.length;
  if (totalEmployes === 0) {
    return {
      date: aujourdhui.format('YYYY-MM-DD'),
      count: 0,
      total: 0,
      percentage: 0
    };
  }

  // 2. Compter les présents
  const employesPresents = await this.prisma.pointage.findMany({
    where: {
      employeId: { in: employes.map(e => e.id) },
      date: {
        gte: aujourdhui.toDate(),
        lte: aujourdhui.clone().endOf('day').toDate()
      },
      type: 'ENTREE'
    },
    distinct: ['employeId']
  });

  const count = employesPresents.length;
  const percentage = Math.round((count / totalEmployes) * 100);

  return {
    date: aujourdhui.format('YYYY-MM-DD'),
    count,
    total: totalEmployes,
    percentage,
    status: percentage >= 90 ? 'Excellent' : 
           percentage >= 70 ? 'Bon' : 
           percentage >= 50 ? 'Moyen' : 'Faible'
  };
}


async calculerHeuresSupplementairesEmploye(employeId: string) {
  // Date de début (début du mois en cours)
  const debut = moment().tz(this.timezone).startOf('month');
  // Date de fin (aujourd'hui)
  const fin = moment().tz(this.timezone).endOf('day');

  // Récupérer les pointages de l'employé pour la période
  const pointages = await this.prisma.pointage.findMany({
    where: {
      employeId,
      date: {
        gte: debut.toDate(),
        lte: fin.toDate()
      }
    },
    orderBy: { heure: 'asc' }
  });

  let heuresSupplementaires = 0;
  let entreePrecedente: Date | null = null;
  const heuresParJour: Record<string, number> = {};

  for (const pointage of pointages) {
    const dateJour = moment(pointage.date).format('YYYY-MM-DD');
    
    if (pointage.type === 'ENTREE') {
      entreePrecedente = pointage.heure;
    } else if (pointage.type === 'SORTIE' && entreePrecedente) {
      const heureEntree = moment(entreePrecedente).tz(this.timezone);
      const heureSortie = moment(pointage.heure).tz(this.timezone);
      
      const dureeHeures = heureSortie.diff(heureEntree, 'hours', true);
      heuresParJour[dateJour] = (heuresParJour[dateJour] || 0) + dureeHeures;
      
      entreePrecedente = null;
    }
  }

  // Calculer les heures supplémentaires (plus de 8h par jour)
  for (const [date, heures] of Object.entries(heuresParJour)) {
    if (heures > 8) {
      heuresSupplementaires += heures - 8;
    }
  }

  // Mettre à jour le champ heuresSupp dans la base de données
  const employe = await this.prisma.employe.update({
    where: { id: employeId },
    data: { heuresSupp: parseFloat(heuresSupplementaires.toFixed(2)) },
    select: {
      id: true,
      heuresSupp: true,
      utilisateur: {
        select: {
          nom: true,
          prenom: true
        }
      }
    }
  });

  return {
    employe: `${employe.utilisateur.prenom} ${employe.utilisateur.nom}`,
    heuresSupplementaires: employe.heuresSupp,
    periode: {
      debut: debut.format('YYYY-MM-DD'),
      fin: fin.format('YYYY-MM-DD')
    }
  };
}
}