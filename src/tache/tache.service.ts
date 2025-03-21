import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTacheDto } from './dto/create-tache.dto'; // Assurez-vous que le chemin est correct
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Injectable()
export class TacheService {
  constructor(private prisma: PrismaService) {}

  // Ajouter une tâche
  async createTache(data: CreateTacheDto) {
    return this.prisma.tache.create({
      data: {
        titre: data.titre,
        description: data.description,
        statut: data.statut || 'A_FAIRE', // Par défaut, "A_FAIRE"
        dateLimite: data.dateLimite,
        employe: {
          connect: { id: data.employeId }, // Connexion avec l'employeId
        },
      },
    });
  }

  // Récupérer toutes les tâches d'un employé
  async getTachesByEmploye(employeId: string) {
    return this.prisma.tache.findMany({
      where: { employeId },
    });
  }

  // Mettre à jour une tâche
  async updateTache(id: string, data: Prisma.TacheUpdateInput) {
    if (!data) {
      throw new Error("Aucune donnée fournie pour la mise à jour");
    }
    if (data.statut) {
      return this.prisma.tache.update({
        where: { id },
        data,
      });
    }
    return null; // أو معالجة الحالة في حال لم يتم تقديم حالة
  }

  // Supprimer une tâche
  async deleteTache(id: string) {
    return this.prisma.tache.delete({
      where: { id },
    });
  }
}
