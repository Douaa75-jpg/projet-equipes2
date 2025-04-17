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

  @Cron('0 10 * * *') 
  async enregistrerAbsences() {
    const dateAujourdhui = moment.utc().startOf('day').toISOString();
    const finJournee = moment.utc().startOf('day').add(10, 'hours').toISOString();
  
    this.logger.log('Vérification des absences...');
  
    // Vérification de l'heure actuelle
    const heureActuelle = moment.utc();
    if (heureActuelle.isBefore(moment.utc().startOf('day').add(10, 'hours'))) {
      this.logger.log('Il est avant 10h00, pas d\'enregistrement d\'absences.');
      return;
    }
  
    // Récupérer les employés absents
    const employesAbsents = await this.prisma.employe.findMany({
      where: {
        pointages: {
          none: { date: { gte: dateAujourdhui, lte: finJournee } },
        },
      },
    });
  
    this.logger.log(`Employés absents à 10h00: ${employesAbsents.length}`);
  
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

      const dateDebutJournee = moment.utc(date).startOf('day').add(8, 'hours'); // 8:00
      const dateFinJournee = moment.utc(date).startOf('day').add(10, 'hours'); // 10:00
  
      // Vérifier si l'employé a déjà pointé ce jour-là
      const pointageExistant = await this.prisma.pointage.findFirst({
        where: {
          employeId,
          date: {
            gte: dateDebutJournee.toISOString(),
            lte: dateFinJournee.toISOString(),
          },
        },
      });
  
      if (pointageExistant) {
        throw new BadRequestException("L'employé a déjà pointé ce jour.");
      }
  
      // Vérification si l'heure d'arrivée est après 10h00
      const arriveeMoment = moment.utc(heureArrivee);
      if (arriveeMoment.isAfter(dateFinJournee)) {
        throw new BadRequestException("Le pointage est interdit après 10h00.");
      }
  
      // Vérification du statut
      let statut: Statut = Statut.PRESENT; // Statut par défaut (avant 8h15)
      const debutJourneeStandard = moment.utc(date).startOf('day').add(8, 'hours');
      
      if (arriveeMoment.isAfter(debutJourneeStandard) && arriveeMoment.isBefore(debutJourneeStandard.add(15, 'minutes'))) {
        statut = Statut.PRESENT;
      } else if (arriveeMoment.isAfter(debutJourneeStandard.add(15, 'minutes'))) {
        statut = Statut.RETARD;
      }
  
      return await this.prisma.pointage.create({
        data: {
          employeId,
          date: dateConverted,  // Utilisation de Date ici
          heureArrivee: heureArriveeConverted,  
          statut,
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
      const startOfDay = moment.utc(date).startOf('day').toISOString();
      const endOfDay = moment.utc(date).endOf('day').toISOString();
      const heureDepartMoment = moment.utc(heureDepart);
  
      if (heureDepartMoment.isBefore(moment.utc(date).startOf('day').add(8, 'hours'))) {
        throw new BadRequestException("Le départ ne peut pas être avant l'heure de début.");
      }
  
      // Recherche du pointage pour l'employé et la date donnée
      const pointage = await this.prisma.pointage.findFirst({
        where: {
          employeId: employeId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
  
      if (!pointage) {
        throw new NotFoundException("Pointage non trouvé pour cet employé à cette date.");
      }

      if (pointage.statut !== "PRESENT" && pointage.statut !== "RETARD") {
        throw new BadRequestException("L'employé doit être présent ou en retard pour enregistrer l'heure de départ.");
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
  

  // Enregistrer l'heure de départ pour le déjeuner
async enregistrerHeureDepartDej(employeId: string, date: string, heureDepartDej: string) {
  try {
    const debutDej = moment.utc(date).startOf('day').add(12, 'hours'); // 12:00 (Début de la pause déjeuner)
    const heureDepartDejMoment = moment.utc(heureDepartDej);

    if (heureDepartDejMoment.isBefore(debutDej)) {
      throw new BadRequestException("Le départ pour déjeuner ne peut pas être avant 12:00.");
    }

    // Trouver le pointage de l'employé pour cette date
    const pointage = await this.prisma.pointage.findFirst({
      where: {
        employeId: employeId,
        date: date, // Assurez-vous que le format de la date est cohérent
      },
    });

    if (!pointage) {
      throw new NotFoundException("Pointage non trouvé pour cet employé à cette date.");
    }

    // Mise à jour de l'heure de départ pour déjeuner
    await this.prisma.pointage.update({
      where: {
        id: pointage.id, // Mise à jour par l'id du pointage trouvé
      },
      data: { heureDepartDej: heureDepartDejMoment.toISOString() },
    });

    return { message: "Heure de départ pour déjeuner enregistrée avec succès." };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'heure de départ pour déjeuner:", error);
    throw new BadRequestException("Erreur lors de l'enregistrement de l'heure de départ pour déjeuner.");
  }
}
 // Enregistrer l'heure de retour du déjeuner
async enregistrerHeureRetourDej(employeId: string, date: string, heureRetourDej: string) {
  try {
    const finDej = moment.utc(date).startOf('day').add(13, 'hours'); // 13:00 (Fin de la pause déjeuner)
    const heureRetourDejMoment = moment.utc(heureRetourDej);

    if (heureRetourDejMoment.isBefore(finDej)) {
      throw new BadRequestException("Le retour de déjeuner ne peut pas être avant 13:00.");
    }

    // Trouver le pointage de l'employé pour cette date
    const pointage = await this.prisma.pointage.findFirst({
      where: {
        employeId: employeId,
        date: date, // Assurez-vous que le format de la date est cohérent
      },
    });

    if (!pointage) {
      throw new NotFoundException("Pointage non trouvé pour cet employé à cette date.");
    }

    // Mise à jour de l'heure de retour de déjeuner
    await this.prisma.pointage.update({
      where: {
        id: pointage.id, // Mise à jour par l'id du pointage trouvé
      },
      data: { heureRetourDej: heureRetourDejMoment.toISOString() },
    });

    return { message: "Heure de retour de déjeuner enregistrée avec succès." };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'heure de retour de déjeuner:", error);
    throw new BadRequestException("Erreur lors de l'enregistrement de l'heure de retour de déjeuner.");
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
    const dateDebutJournee = moment.utc(date).startOf('day').toISOString();
    const dateFinJournee = moment.utc(date).endOf('day').toISOString();

    const pointage = await this.prisma.pointage.findFirst({
      where: {
        employeId,
        date: {
          gte: dateDebutJournee,
          lte: dateFinJournee,
        },
      },
      include: { employe: true },
    });

    if (!pointage) {
      return { statut: Statut.ABSENT };  // Utilisez Statut.ABSENT ici
    }

    let statut: Statut = Statut.PRESENT;
    if (statut === Statut.PRESENT) {  // Ne modifier que si PRESENT
      const heureLimite = moment.utc(date).set({ hour: 9, minute: 0, second: 0 });
      if (moment.utc(pointage.heureArrivee).isAfter(heureLimite)) {
        statut = Statut.RETARD;  
      }
    }

    return {
      ...pointage,
      statut,
    };
  }


  // Calcul des heures de travail et des heures supplémentaires
  async calculerHeuresTravail(employeId: string, dateDebut: string, dateFin: string): Promise<any> {
    const pointages = await this.prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: dateDebut,
          lte: dateFin,
        },
      },
    });

    let totalHeures = 0;
    let totalHeuresSup = 0;

    if (pointages.length === 0) {
      throw new Error("Aucun pointage trouvé pour cette période.");
    }

    for (const pointage of pointages) {
      if (pointage.heureArrivee && pointage.heureDepart) {
        const arrivee = moment(pointage.heureArrivee);
        const depart = moment(pointage.heureDepart);

        if (arrivee.isValid() && depart.isValid()) {
          let duree = depart.diff(arrivee, 'hours', true);

          if (pointage.heureDepartDej && pointage.heureRetourDej) {
            const departDej = moment(pointage.heureDepartDej);
            const retourDej = moment(pointage.heureRetourDej);

            if (departDej.isValid() && retourDej.isValid()) {
              const dureePause = retourDej.diff(departDej, 'hours', true);
              duree -= dureePause;
            }
          }

          totalHeures += duree;

          if (duree > 8) {
            totalHeuresSup += duree - 8;
          }
        }
      }
    }
    return { totalHeures, totalHeuresSup };
  }

  // Enregistrer la pause déjeuner
  async enregistrerPauseDejeuner(id: string, updatePointageDto: UpdatePointageDto) {
    const { heureDepartDej, heureRetourDej } = updatePointageDto;

    if (!heureDepartDej || !heureRetourDej) {
      throw new Error("Les heures de pause déjeuner sont requises.");
    }

    return this.prisma.pointage.update({
      where: { id },
      data: {
        heureDepartDej,
        heureRetourDej,
      },
    });
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

  
}

