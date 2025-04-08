import { Injectable ,HttpException , HttpStatus} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTacheDto } from './dto/create-tache.dto'; // Assurez-vous que le chemin est correct
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Injectable()
export class TacheService {
  constructor(private prisma: PrismaService) {}

  // Ajouter une tâche
  async createTache(data: CreateTacheDto) {
    try {
      // Vérification et conversion de la dateLimite
      let dateLimite: Date | null = null;
      if (data.dateLimite) {
        dateLimite = new Date(data.dateLimite);
        if (isNaN(dateLimite.getTime())) {
          throw new HttpException(
            'Le format de la date limite est invalide.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    return this.prisma.tache.create({
      data: {
        titre: data.titre,
        description: data.description,
        statut: data.statut || 'A_FAIRE', // Par défaut, "A_FAIRE"
        dateLimite: dateLimite,
        employe: {
          connect: { id: data.employeId }, // Connexion avec l'employeId
        },
      },
    });
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error.message);
    throw new HttpException("Une erreur est survenue lors de la création de la tâche." , HttpStatus.INTERNAL_SERVER_ERROR,);
  }
}

  // Récupérer toutes les tâches d'un employé
  async getTachesByEmploye(employeId: string) {
    try {
      return await this.prisma.tache.findMany({
        where: { employeId },
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error.message);
      throw new HttpException(
        "Erreur lors de la récupération des tâches de l'employé.",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  // Mettre à jour une tâche
  async updateTache(id: string, data: Prisma.TacheUpdateInput) {
    try {
      // Vérification si la tâche existe dans la base de données
      const existingTache = await this.prisma.tache.findUnique({
        where: { id },
      });
  
      if (!existingTache) {
        throw new HttpException('Tâche non trouvée.', HttpStatus.NOT_FOUND);
      }
  
      // Si les données de mise à jour sont vides, on renvoie une erreur
      if (!data || Object.keys(data).length === 0) {
        throw new HttpException('Aucune donnée fournie pour la mise à jour.', HttpStatus.BAD_REQUEST);
      }
   // Vérification de la validité de la dateLimite si elle est présente dans data
   if (data.dateLimite) {
    // Si dateLimite est une chaîne, la convertir en date
    if (typeof data.dateLimite === 'string') {
      const date = new Date(data.dateLimite);
      if (isNaN(date.getTime())) {
        throw new HttpException('Le format de la date limite est invalide.', HttpStatus.BAD_REQUEST);
      }
      data.dateLimite = date;  // Assigner la date convertie à la variable dateLimite
    }
    // Si c'est déjà une instance de Date, on n'a rien à faire
    else if (!(data.dateLimite instanceof Date)) {
      throw new HttpException('Le format de la date limite est invalide.', HttpStatus.BAD_REQUEST);
    }
  }
  
      // Si tout est valide, procéder à la mise à jour
      return await this.prisma.tache.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error.message);
      throw new HttpException('Erreur lors de la mise à jour de la tâche.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  async getTacheById(id: string) {
    try {
      const tache = await this.prisma.tache.findUnique({
        where: { id },
      });

      if (!tache) {
        throw new HttpException('Tâche non trouvée.', HttpStatus.NOT_FOUND);
      }

      return tache;
    } catch (error) {
      console.error('Erreur lors de la récupération de la tâche:', error.message);
      throw new HttpException(
        'Erreur lors de la récupération de la tâche.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  

  // Supprimer une tâche
  async deleteTache(id: string) {
    try {
    const existingTache = await this.prisma.tache.findUnique({ where: { id } });
    if (!existingTache) {
      throw new HttpException('Tâche non trouvée', HttpStatus.NOT_FOUND);
    }
    return this.prisma.tache.delete({ where: { id } });
  } catch (error) {
    // سجل الخطأ في log ولا ردّو في الواجهة
    console.error('erreur dans deleteTache:', error.message);
    throw new HttpException('Erreur lors de la suppression de la tâche.', HttpStatus.INTERNAL_SERVER_ERROR);
  
  } 
}
}
