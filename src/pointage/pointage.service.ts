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
      throw new NotFoundException('Employé non trouvé');
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
            matricule: true
          }
        },
        heuresTravail: true
      }
    });

    return equipe.map(emp => ({
      ...emp,
      heuresTravailFormatted: this.formatHeures(emp.heuresTravail || 0)
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

  // في pointage.service.ts

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
}