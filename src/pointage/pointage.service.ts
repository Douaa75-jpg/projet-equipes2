import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePointageDto } from './dto/create-pointage.dto';
import { UpdatePointageDto } from './dto/update-pointage.dto';
import { Pointage, Statut } from '@prisma/client';
import moment from 'moment';

@Injectable()
export class PointageService {
  constructor(private prisma: PrismaService) {}

  // ✅ Créer un pointage avec calcul du retard
  async create(createPointageDto: CreatePointageDto): Promise<Pointage> {
    const { employeId, heureArrivee, date } = createPointageDto;
  
    // تحييد الساعة في التاريخ (نعمل بداية ونهاية اليوم)
    const dateDebutJournee = moment.utc(date).startOf('day');
    const dateFinJournee = moment.utc(date).endOf('day');
  
    // نتأكد إذا العامل عمل الحضور في نفس اليوم
    const existingPointage = await this.prisma.pointage.findFirst({
      where: {
        employeId: employeId,
        date: {
          gte: dateDebutJournee.toISOString(), // بداية اليوم
          lte: dateFinJournee.toISOString(),   // نهاية اليوم
        },
      },
    });
  
    if (existingPointage) {
      throw new Error("L'employé a déjà pointé ce jour.");
    }
  
    // نحدد بداية اليوم الساعة 8 صباحًا UTC
    const debutJournee = moment.utc(date).startOf('day').add(8, 'hours');
    const arriveeMoment = moment.utc(heureArrivee);
  
    let statut: Statut = Statut.PRESENT; // الحالة الافتراضية
  
    console.log(`Début journée: ${debutJournee.format()}`);
    console.log(`Heure arrivée: ${arriveeMoment.format()}`);
  
    // نقارن الوقت بالساعة 8 صباحًا
    if (arriveeMoment.isAfter(debutJournee)) {
      const retardMinutes = arriveeMoment.diff(debutJournee, 'minutes');
  
      console.log(`Retard en minutes: ${retardMinutes}`);
  
      if (retardMinutes > 15) {
        statut = Statut.RETARD;
      }
    }
  
    // نسجل الحضور بالحالة المناسبة
    const pointage = await this.prisma.pointage.create({
      data: {
        employeId: employeId,
        date: date,
        heureArrivee: heureArrivee,
        statut: statut,
        heureDepart: null,
      },
    });
  
    return pointage;
  }

  // ✅ Calcul des heures de travail et des heures supplémentaires
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
  
    // Vérification si des pointages existent
    if (pointages.length === 0) {
      throw new Error("Aucun pointage trouvé pour cette période.");
    }
  
    for (const pointage of pointages) {
      if (pointage.heureArrivee && pointage.heureDepart) {
        const arrivee = moment(pointage.heureArrivee);
        const depart = moment(pointage.heureDepart);
  
        if (arrivee.isValid() && depart.isValid()) {
          let duree = depart.diff(arrivee, 'hours', true); // Calcul de la durée en heures
  
          // Vérifier si la pause déjeuner existe
          if (pointage.heureDepartDej && pointage.heureRetourDej) {
            const departDej = moment(pointage.heureDepartDej);
            const retourDej = moment(pointage.heureRetourDej);
  
            if (departDej.isValid() && retourDej.isValid()) {
              const dureePause = retourDej.diff(departDej, 'hours', true); // Calcul de la durée de la pause
              duree -= dureePause; // Déduire la pause du temps total
            }
          }
  
          console.log(`Durée pour ce pointage: ${duree} heures`); // Debug de la durée
  
          totalHeures += duree;
  
          // Vérification des heures supplémentaires (plus de 8 heures de travail)
          if (duree > 8) {
            totalHeuresSup += duree - 8;
          }
        }
      }
    }
  
    return { totalHeures, totalHeuresSup };
  }
  



  // ✅ Enregistrer la pause déjeuner
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

  // ✅ Récupérer tous les pointages
  async findAll() {
    return this.prisma.pointage.findMany({
      include: { employe: true }, // Inclure les détails de l'employé
    });
  }

  // ✅ Récupérer un pointage par ID
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

  // ✅ Enregistrer l'heure de départ
  async update(id: string, updatePointageDto: UpdatePointageDto): Promise<Pointage> {
    const { heureDepart, heureDepartDej, heureRetourDej, statut,heureArrivee, nom, prenom } = updatePointageDto;

    // Trouver le pointage existant
    const pointage = await this.prisma.pointage.findUnique({
      where: { id },
    });

    if (!pointage) {
      throw new NotFoundException(`Pointage avec l'ID ${id} introuvable`);
    }

    // Construire l'objet de mise à jour dynamiquement
    const updateData: any = {};
    
    if (heureArrivee) updateData.heureArrivee = new Date(heureArrivee);
    if (heureDepart) updateData.heureDepart = new Date(heureDepart);
    if (heureDepartDej) updateData.heureDepartDej = new Date(heureDepartDej);
    if (heureRetourDej) updateData.heureRetourDej = new Date(heureRetourDej);
    if (statut) updateData.statut = statut;

    // Vérifier si le nom et prénom doivent être mis à jour
    if (nom || prenom) {
      updateData.employe = {
        update: {
          ...(nom ? { nom } : {}),
          ...(prenom ? { prenom } : {}),
        },
      };
    }

    // Mettre à jour les informations du pointage
    return this.prisma.pointage.update({
      where: { id },
      data: updateData,
    });
  }

  // ✅ Supprimer un pointage
  async remove(id: string) {
    return this.prisma.pointage.delete({ where: { id } });
  }

  // ✅ Récupérer le nombre d'absences d'un employé
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
