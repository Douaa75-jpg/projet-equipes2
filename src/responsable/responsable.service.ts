import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResponsableService {
  constructor(private prisma: PrismaService) {}

  // Créer un responsable
  async create(createResponsableDto: CreateResponsableDto) {
    // Vérification de l'email existant
    const existingUser = await this.prisma.utilisateur.findUnique({
      where: { email: createResponsableDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('L\'email est déjà utilisé.');
    }

    // Générer un sel et hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createResponsableDto.motDePasse, salt);

    // Création du responsable avec l'utilisateur associé
    return this.prisma.responsable.create({
      data: {
        typeResponsable: createResponsableDto.typeResponsable,
        utilisateur: {
          create: {
            nom: createResponsableDto.nom,
            prenom: createResponsableDto.prenom,
            email: createResponsableDto.email,
            role: 'RESPONSABLE', // Définir le rôle
            motDePasse: hashedPassword, // Mot de passe sécurisé
          },
        },
      },
      select: {
        id: true,
        typeResponsable: true,
      },
    });
  }


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
          nom: true,
          prenom: true,
          email: true,
        },
      },
      employes: {
        select: {
          utilisateur: {
            select: {
              nom: true,
              prenom: true,
              email: true,
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

    let updatedData: any = {
      nom: updateResponsableDto.nom,
      prenom: updateResponsableDto.prenom,
      email: updateResponsableDto.email,
    };

    // Vérifier si un mot de passe est fourni, sinon ne pas le modifier
    if (updateResponsableDto.motDePasse) {
      const salt = await bcrypt.genSalt(10);
      updatedData.motDePasse = await bcrypt.hash(updateResponsableDto.motDePasse, salt);
    }

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
    });

    if (!responsable) {
      throw new NotFoundException(`Responsable avec l'ID ${id} introuvable`);
    }

    return this.prisma.responsable.delete({
      where: { id },
    });
  }

  
}
