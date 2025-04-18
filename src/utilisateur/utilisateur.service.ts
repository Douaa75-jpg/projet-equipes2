import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import * as bcrypt from 'bcrypt';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';


@Injectable()
export class UtilisateursService {
  constructor(private prisma: PrismaService) {}

  // Trouver un utilisateur par email
  async findByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({
      where: { email },
    });
  }

  // Créer un utilisateur avec gestion des rôles et responsableId pour les employés
  async create(createUtilisateurDto: CreateUtilisateurDto) {
    const existingUser = await this.prisma.utilisateur.findUnique({
      where: { email: createUtilisateurDto.email },
    });

    if (existingUser) {
      throw new Error('Cet email est déjà utilisé.');
    }

    // Hacher le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(createUtilisateurDto.motDePasse, 10);

    // Créer l'utilisateur
    const utilisateur = await this.prisma.utilisateur.create({
      data: {
        ...createUtilisateurDto,
        motDePasse: hashedPassword, // Mot de passe haché
      },
    });

    // Logique pour gérer les rôles des utilisateurs
    if (utilisateur.role === 'EMPLOYE') {
      const responsableId = createUtilisateurDto.responsableId;

      // Si aucun responsableId n'est fourni, l'utilisateur sera créé sans responsable
      if (!responsableId) {
        throw new Error('Veuillez spécifier un responsable pour l\'employé.');
      }

      // Créer l'employé avec le responsable spécifié
      await this.prisma.employe.create({
        data: {
          id: utilisateur.id,
          responsableId: responsableId, // Responsabilité assignée manuellement
        },
      });
    } else if (utilisateur.role === 'ADMINISTRATEUR') {
      await this.prisma.administrateur.create({
        data: {
          utilisateur: { connect: { id: utilisateur.id } },
        },
      });
    } else if (utilisateur.role === 'RESPONSABLE') {
      await this.prisma.responsable.create({
        data: {
          utilisateur: { connect: { id: utilisateur.id } },
        },
      });
    }

    return utilisateur;
  }

  // Méthode pour assigner un responsable à un employé
  async assignerResponsable(id: string, responsableId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!utilisateur) {
      throw new Error('Utilisateur non trouvé');
    }

    if (utilisateur.role !== 'EMPLOYE') {
      throw new Error('Seul un employé peut se voir assigner un responsable');
    }

    const employe = await this.prisma.employe.update({
      where: { id: utilisateur.id },
      data: {
        responsableId: responsableId, // Assignation du responsable
      },
    });

    return employe;
  }

  // Récupérer un utilisateur par ID
  async findOne(id: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const { motDePasse, ...userSansMotDePasse } = user;
    return userSansMotDePasse;
  }

  // Mettre à jour un utilisateur
  async update(id: string, updateUtilisateurDto) {
    return this.prisma.utilisateur.update({
      where: { id },
      data: updateUtilisateurDto,
    });
  }

  // Supprimer un utilisateur
  async remove(id: string) {
    // Vérifier si l'ID est défini
    if (!id) {
      throw new Error('L\'ID de l\'utilisateur est manquant');
    }

    // Rechercher l'utilisateur par ID
    const user = await this.prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Supprimer l'utilisateur
    await this.prisma.utilisateur.delete({
      where: { id },
    });

    return { message: 'Utilisateur supprimé avec succès' };
  }

  // Compter le nombre total d'employés
  async countEmployes() {
    return this.prisma.utilisateur.count({
      where: { role: 'EMPLOYE' },
    });
  }

  // Compter le nombre total de responsables
  async countResponsables() {
    return this.prisma.responsable.count({
      where: {
        typeResponsable: 'CHEF_EQUIPE', // Filtrer par typeResponsable CHEF_EQUIPE
      },
    });
  }

 // Trouver tous les utilisateurs
 async findAll() {
  const users = await this.prisma.utilisateur.findMany();
  return users.map(({ motDePasse, ...userSansMotDePasse }) => userSansMotDePasse);
}

}
