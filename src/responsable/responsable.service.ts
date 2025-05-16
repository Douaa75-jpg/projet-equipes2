import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResponsableService {
  constructor(private prisma: PrismaService) {}




   // Ajouter la méthode pour trouver un responsable par ID utilisateur
   async findByUtilisateurId(id: string) {
    const responsable = await this.prisma.responsable.findFirst({
      where: { id },
      select: {
        id: true,
        typeResponsable: true,
      },
    });

    if (!responsable) {
      throw new NotFoundException(`Responsable associé à l'utilisateur avec l'ID ${id} introuvable`);
    }

    return responsable;
  }


// Trouver tous les responsables avec leurs informations d'utilisateur et les employés associés
async findAll() {
  return this.prisma.responsable.findMany({
    where: {
      typeResponsable: 'CHEF_EQUIPE', // Filtrer uniquement les responsables de type CHEF_EQUIPE
    },
    select: {
      id: true,
      typeResponsable: true,
      utilisateur: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          matricule: true, // Ajout du matricule
          datedenaissance: true,
        },
      },
      employes: {
        select: {
          utilisateur: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              matricule: true, // Ajout du matricule
              datedenaissance: true,
            },
          },
        },
      },
    },
  });
}



  // Trouver un responsable par ID
  async findOne(id: string) {
    const responsable = await this.prisma.responsable.findUnique({
      where: { id },
      select: {
        id: true,
        typeResponsable: true,
      },
    });

    if (!responsable) {
      throw new NotFoundException(`Responsable avec l'ID ${id} introuvable`);
    }

    return responsable;
  }

  // Mettre à jour un responsable
  async update(id: string, updateResponsableDto: UpdateResponsableDto) {
    // Vérification des données d'entrée
    if (!updateResponsableDto.nom || !updateResponsableDto.email) {
      throw new BadRequestException('Nom et email sont requis pour la mise à jour');
    }

    // Vérifier si un responsable avec le même email existe déjà
    const existingUser = await this.prisma.utilisateur.findUnique({
      where: { email: updateResponsableDto.email },
    });

    if (existingUser && existingUser.id !== id) {
      throw new BadRequestException('L\'email est déjà utilisé par un autre responsable.');
    }
    
    // Convertir la date de naissance en objet Date si elle est fournie
    let dateDeNaissance: Date | null = null;
    if (updateResponsableDto.datedenaissance) {
      dateDeNaissance = new Date(updateResponsableDto.datedenaissance);
      if (isNaN(dateDeNaissance.getTime())) {
        throw new BadRequestException('La date de naissance doit être une date valide.');
      }
    }

    let updatedData: any = {
      nom: updateResponsableDto.nom,
      prenom: updateResponsableDto.prenom,
      email: updateResponsableDto.email,
      matricule:updateResponsableDto.matricule,
      ...(dateDeNaissance && { datedenaissance: dateDeNaissance }),
    };

    return this.prisma.responsable.update({
      where: { id },
      data: {
        typeResponsable: updateResponsableDto.typeResponsable,
        utilisateur: {
          update: updatedData,
        },
      },
      select: {
        id: true,
        typeResponsable: true,
      },
    });
  }

  // Supprimer un responsable
  async remove(id: string) {
    // Vérifier si le responsable existe
    const responsable = await this.prisma.responsable.findUnique({
      where: { id },
      include: {
        employes: true, // Inclure les employés liés
        notifications: true, // Inclure les notifications liées
      },
    });
  
    if (!responsable) {
      throw new NotFoundException(`Responsable avec l'ID ${id} introuvable`);
    }
  
    // Utiliser une transaction pour garantir l'intégrité des données
    return this.prisma.$transaction(async (prisma) => {
      // 1. Mettre à jour les employés qui ont ce responsable comme responsableId
      if (responsable.employes.length > 0) {
        await prisma.employe.updateMany({
          where: { responsableId: id },
          data: { responsableId: null }, // Retirer la référence
        });
      }
  
      // 2. Supprimer les notifications liées à ce responsable
      if (responsable.notifications.length > 0) {
        await prisma.notification.deleteMany({
          where: { responsableId: id },
        });
      }
  
      // 3. Finalement supprimer le responsable
      return prisma.responsable.delete({
        where: { id },
      });
    });
  }

  
}
