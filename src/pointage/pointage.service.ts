import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePointageDto } from './dto/create-pointage.dto';
import { UpdatePointageDto } from './dto/update-pointage.dto';
import { Pointage, Statut } from '@prisma/client';

@Injectable()
export class PointageService {
  constructor(private prisma: PrismaService) {}

// ✅ Créer un pointage (Arrivée)
async create(createPointageDto: CreatePointageDto): Promise<Pointage> {
  const { employeId, heureArrivee } = createPointageDto;

  const employe = await this.prisma.employe.findUnique({
    where: { id: employeId },
    select: { heureDebutTravail: true },
  });

  if (!employe) throw new NotFoundException('Employé non trouvé');

  // 🔥 Utiliser directement heureDebutTravail, qui est déjà de type Date
  const dateHeureDebut = employe.heureDebutTravail;

  // heureArrivee est aussi de type Date (prisma gère cela avec DateTime)
  const heureArriveeDate = new Date(heureArrivee);  // Si nécessaire, sinon tu peux aussi l'utiliser directement

  let statut: Statut;

  if (heureArriveeDate > dateHeureDebut) {
    const retardMinutes = (heureArriveeDate.getTime() - dateHeureDebut.getTime()) / (1000 * 60);
    statut = retardMinutes > 15 ? Statut.RETARD : Statut.PRESENT;
  } else {
    statut = Statut.PRESENT;
  }

  return this.prisma.pointage.create({
    data: {
      employeId,
      date: new Date(),
      heureArrivee: heureArriveeDate,
      heureDepart: null,
      statut,
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
  async update(id: string, updatePointageDto: UpdatePointageDto) {
    const pointage = await this.prisma.pointage.findUnique({ where: { id } });

    if (!pointage) {
      throw new NotFoundException(`Pointage avec l'ID ${id} introuvable`);
    }

    const heureDepart = updatePointageDto.heureDepart ? new Date(updatePointageDto.heureDepart) : null;

    if (heureDepart && heureDepart <= new Date(pointage.heureArrivee)) {
      throw new Error(`L'heure de départ ne peut pas être avant l'heure d'arrivée.`);
    }

    return this.prisma.pointage.update({
      where: { id },
      data: {
        heureDepart,
      },
    });
  }

  // ✅ Supprimer un pointage
  async remove(id: string) {
    return this.prisma.pointage.delete({ where: { id } });
  }

  // ✅ Calculer les heures de travail et les heures supplémentaires avec validation
  async calculerHeuresTravail(employeId: string) {
    const pointages = await this.prisma.pointage.findMany({
      where: { employeId },
    });

    console.log(`Pointages récupérés pour l'employé ${employeId} :`, pointages);

    let heuresTravail = 0;
    let heuresSupp = 0;
   

    for (const pointage of pointages) {
      if (pointage.heureArrivee && pointage.heureDepart) {
        const dateEntree = new Date(pointage.heureArrivee);
        const dateSortie = new Date(pointage.heureDepart);

        if (dateSortie <= dateEntree) {
          console.warn(`Erreur: Heure de départ avant heure d’arrivée pour ${pointage.id}`);
          continue;
        }

        // Vérifier si les dates sont valides
        if (isNaN(dateEntree.getTime()) || isNaN(dateSortie.getTime())) {
          console.warn('Problème de conversion des dates pour le pointage ${pointage.id}');
          continue;
        }

        const heures = (dateSortie.getTime() - dateEntree.getTime()) / (1000 * 3600);

        heuresTravail += heures;
        if (heures > 8) {
          heuresSupp += heures - 8;
        }
      } else {
        console.warn('Pointage incomplet trouvé : ${JSON.stringify(pointage)}');
      }
    }

    console.log('Total heures: ${heuresTravail}, Heures supp: ${heuresSupp}');
    return { heuresTravail, heuresSupp };
  }











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