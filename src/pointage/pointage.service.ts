import { Injectable, NotFoundException,Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePointageDto } from './dto/create-pointage.dto';
import { UpdatePointageDto } from './dto/update-pointage.dto';
import { Pointage, Statut } from '@prisma/client';
import moment from 'moment';
import { Cron } from '@nestjs/schedule';


@Injectable()
export class PointageService {
  private readonly logger = new Logger(PointageService.name);
  constructor(private prisma: PrismaService) {}

  @Cron('0 23 * * *')
  async enregistrerAbsences() {
    const dateAujourdhui = moment.utc().startOf('day').toISOString();
    
  
    this.logger.log('Vérification des absences...');
  
     // Récupérer les employés absents (ceux sans pointage du tout aujourd'hui)
     const employesAbsents = await this.prisma.employe.findMany({
      where: {
        pointages: {
          none: { 
            date: {
              gte: moment.utc().startOf('day').toISOString(),
              lte: moment.utc().endOf('day').toISOString()
            } 
          },
        },
      },
    });

    this.logger.log(`Employés absents aujourd'hui: ${employesAbsents.length}`);
    // Ajouter les absences
    await this.prisma.pointage.createMany({
      data: employesAbsents.map(employe => ({
        employeId: employe.id,
        date: dateAujourdhui,
        heureArrivee: new Date(),
        statut: Statut.ABSENT,
        heureDepart: null,
      })),
      skipDuplicates: true,
      }).then(() => {
        this.logger.log('Les absences ont été ajoutées avec succès.');
      }).catch(error => {
        this.logger.error('Erreur lors de l\'ajout des absences:', error);
      });
  
    employesAbsents.forEach(employe =>
      this.logger.warn(`Employé ${employe.id} est marqué comme ABSENT.`)
    );
  
    // Vérifier si les absences ont été ajoutées avec succès
    const absentsAfterInsert = await this.prisma.pointage.findMany({
      where: {
        statut: Statut.ABSENT,
        date: dateAujourdhui,
      },
    });
  
    this.logger.log(`Nombre de pointages absents après l'ajout : ${absentsAfterInsert.length}`);
  }
  



  //  Créer un pointage avec calcul du retard
  async create(createPointageDto: CreatePointageDto): Promise<Pointage> {
    try {
      const { employeId, heureArrivee, date } = createPointageDto;
      console.log('Données reçues pour le pointage:', createPointageDto);
      
      const dateConverted = new Date(date);
      const heureArriveeConverted = new Date(heureArrivee);

      // Vérifier si l'employé a déjà pointé ce jour-là
      const pointageExistant = await this.prisma.pointage.findFirst({
        where: {
          employeId,
          date: {
            gte: moment.utc(date).startOf('day').toISOString(),
            lte: moment.utc(date).endOf('day').toISOString(),
          },
        },
      });
  
      if (pointageExistant) {
        throw new BadRequestException("L'employé a déjà pointé ce jour.");
      }
  
      return await this.prisma.pointage.create({
        data: {
          employeId,
          date: dateConverted,  // Utilisation de Date ici
          heureArrivee: heureArriveeConverted,  
          statut: Statut.PRESENT,
          heureDepart: null,
        },
      });
  
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du pointage:", error);
      throw new BadRequestException("Échec de l’enregistrement du pointage");
    }
  }


   // Enregistrer l'heure de départ
   async enregistrerHeureDepart(employeId: string, date: string, heureDepart: string) {
    try {
      const heureDepartMoment = moment.utc(heureDepart);
  
  
      // Recherche du pointage pour l'employé et la date donnée
      const pointage = await this.prisma.pointage.findFirst({
        where: {
          employeId: employeId,
          date: {
            gte: moment.utc(date).startOf('day').toISOString(),
            lte: moment.utc(date).endOf('day').toISOString(),
          },
        },
      });
  
      if (!pointage) {
        throw new NotFoundException("Pointage non trouvé pour cet employé à cette date.");
      }

      if (pointage.heureArrivee && heureDepartMoment.isBefore(moment(pointage.heureArrivee))) {
        throw new BadRequestException("L'heure de départ doit être après l'heure d'arrivée.");
      }
  
      // Mise à jour de l'heure de départ
      await this.prisma.pointage.update({
        where: { id: pointage.id },
        data: { heureDepart: heureDepartMoment.toISOString() },
      });
  
      return { message: "Heure de départ enregistrée avec succès." };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'heure de départ:", error);
      throw new BadRequestException("Erreur lors de l'enregistrement de l'heure de départ.");
    }
  }
  async findAllByEmploye(employeId: string) {
    return this.prisma.pointage.findMany({
      where: { employeId: employeId },
      orderBy: { date: 'desc' }, // Tri par date décroissante
    });
  }
  

   // Récupérer le pointage de l'employé pour la journée en cours
   async getPointageByEmployeId(employeId: string, date: string) {
    const pointage = await this.prisma.pointage.findFirst({
      where: {
        employeId,
        date: {
          gte: moment.utc(date).startOf('day').toISOString(),
          lte: moment.utc(date).endOf('day').toISOString(),
        },
      },
      include: { employe: true },
    });

    if (!pointage) {
      return { statut: Statut.ABSENT };
    }

    return pointage;
  }

  // Calcul des heures de travail et des heures supplémentaires
  async calculerHeuresTravail(employeId: string, dateDebut: string, dateFin: string) {
    const pointages = await this.prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: dateDebut,
          lte: dateFin,
        },
        statut: Statut.PRESENT, // Seulement les présences
      },
    });

    let totalHeures = 0;
    let totalHeuresSup = 0;

    pointages.forEach(pointage => {
      if (pointage.heureArrivee && pointage.heureDepart) {
        const arrivee = moment(pointage.heureArrivee);
        const depart = moment(pointage.heureDepart);
        let duree = depart.diff(arrivee, 'hours', true);

        // Soustraire la pause déjeuner si elle existe
        if (pointage.heureDepartDej && pointage.heureRetourDej) {
          const dureePause = moment(pointage.heureRetourDej).diff(moment(pointage.heureDepartDej), 'hours', true);
          duree -= dureePause;
        }

        totalHeures += duree;
        if (duree > 8) {
          totalHeuresSup += duree - 8;
        }
      }
    });

    return { totalHeures, totalHeuresSup };
  }

  //  Récupérer tous les pointages
  async findAll() {
    return this.prisma.pointage.findMany({
      include: { employe: true },
    });
  }

  //  Récupérer un pointage par ID
  async findOne(id: string) {
    const pointage = await this.prisma.pointage.findUnique({
      where: { id },
      include: { employe: true },
    });

    if (!pointage) {
      throw new NotFoundException(`Pointage avec l'ID ${id} introuvable`);
    }
    return pointage;
  }

  //  Enregistrer l'heure de départ
  async update(id: string, updatePointageDto: UpdatePointageDto): Promise<Pointage> {
    const { heureDepart, heureDepartDej, heureRetourDej, statut, heureArrivee, nom, prenom } = updatePointageDto;

    const pointage = await this.prisma.pointage.findUnique({
      where: { id },
    });

    if (!pointage) {
      throw new NotFoundException(`Pointage avec l'ID ${id} introuvable`);
    }

    const updateData: any = {};

    if (heureArrivee) updateData.heureArrivee = new Date(heureArrivee);
    if (heureDepart) updateData.heureDepart = new Date(heureDepart);
    if (heureDepartDej) updateData.heureDepartDej = new Date(heureDepartDej);
    if (heureRetourDej) updateData.heureRetourDej = new Date(heureRetourDej);
    if (statut) updateData.statut = statut;

    if (nom || prenom) {
      updateData.employe = {
        update: {
          ...(nom ? { nom } : {}),
          ...(prenom ? { prenom } : {}),
        },
      };
    }

    return this.prisma.pointage.update({
      where: { id },
      data: updateData,
    });
  }

  //  Supprimer un pointage
  async remove(id: string) {
    return this.prisma.pointage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  

  // Récupérer le nombre d'absences d'un employé
  async getNbAbsences(employeId: string): Promise<number> {
    const absences = await this.prisma.pointage.count({
      where: {
        employeId,
        statut: 'ABSENT',
      },
    });

    return absences;
  }

  // Ajoutez cette méthode si elle n'existe pas
  async getNombreEmployesPresentParJour(dateDebut: string, dateFin: string) {
    // Vérifier que dateDebut est avant dateFin
    if (moment(dateDebut).isAfter(moment(dateFin))) {
      throw new BadRequestException("La date de début doit être avant la date de fin");
    }

    const pointages = await this.prisma.pointage.findMany({
      where: {
        date: {
          gte: moment.utc(dateDebut).startOf('day').toISOString(),
          lte: moment.utc(dateFin).endOf('day').toISOString(),
        },
        statut: Statut.PRESENT,
      },
      select: {
        date: true,
        employeId: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const result = pointages.reduce((acc, pointage) => {
      const dateStr = moment(pointage.date).format('YYYY-MM-DD');
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          nombreEmployesPresent: 0,
          employesIds: new Set<string>(),
        };
      }
      
      acc[dateStr].employesIds.add(pointage.employeId);
      acc[dateStr].nombreEmployesPresent = acc[dateStr].employesIds.size;
      
      return acc;
    }, {});

    return Object.values(result).map((item: any) => ({
      date: item.date,
      nombreEmployesPresent: item.nombreEmployesPresent,
    }));
  }

  async getNombreEmployesPresentAujourdhui() {
    const aujourdhui = moment().format('YYYY-MM-DD');
    const result = await this.getNombreEmployesPresentParJour(aujourdhui, aujourdhui);
    return result[0]?.nombreEmployesPresent || 0;
  }

  async getNombreEmployesAbsentParJour(dateDebut: string, dateFin: string) {
    // Vérifier que dateDebut est avant dateFin
    if (moment(dateDebut).isAfter(moment(dateFin))) {
      throw new BadRequestException("La date de début doit être avant la date de fin");
    }
  
    // Récupérer tous les employés
    const tousLesEmployes = await this.prisma.employe.findMany({
      select: { id: true }
    });
  
    // Récupérer les pointages dans la période
    const pointages = await this.prisma.pointage.findMany({
      where: {
        date: {
          gte: moment.utc(dateDebut).startOf('day').toISOString(),
          lte: moment.utc(dateFin).endOf('day').toISOString(),
        },
        statut: Statut.ABSENT,
      },
      select: {
        date: true,
        employeId: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  
    // Compter les absences par jour
    const result = pointages.reduce((acc, pointage) => {
      const dateStr = moment(pointage.date).format('YYYY-MM-DD');
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          nombreEmployesAbsent: 0,
          employesIds: new Set<string>(),
        };
      }
      
      acc[dateStr].employesIds.add(pointage.employeId);
      acc[dateStr].nombreEmployesAbsent = acc[dateStr].employesIds.size;
      
      return acc;
    }, {});
  
    // Pour les jours où il n'y a pas d'absences, nous devons quand même les inclure
    const joursSansAbsences = {};
    const currentDate = moment(dateDebut);
    const endDate = moment(dateFin);
  
    while (currentDate.isSameOrBefore(endDate)) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      if (!result[dateStr]) {
        joursSansAbsences[dateStr] = {
          date: dateStr,
          nombreEmployesAbsent: 0,
        };
      }
      currentDate.add(1, 'day');
    }
  
    return Object.values({
      ...result,
      ...joursSansAbsences,
    }).map((item: any) => ({
      date: item.date,
      nombreEmployesAbsent: item.nombreEmployesAbsent || 0,
    }));
  }
  
  // Méthode pour récupérer le nombre d'absents aujourd'hui
  async getNombreEmployesAbsentAujourdhui() {
    const aujourdhui = moment().format('YYYY-MM-DD');
    const result = await this.getNombreEmployesAbsentParJour(aujourdhui, aujourdhui);
    return result[0]?.nombreEmployesAbsent || 0;
  }
}

