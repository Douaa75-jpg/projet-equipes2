import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UtilisateursService {
  constructor(private prisma: PrismaService) {}

  // Trouver un utilisateur par email
  async findByEmail(email: string) {
    return this.prisma.utilisateur.findUnique({
      where: { email },
    });
  }

  // Créer un utilisateur avec gestion des rôles
  async create(createUtilisateurDto: CreateUtilisateurDto) {
    // Hacher le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(createUtilisateurDto.motDePasse, 10);

    // Créer l'utilisateur
    const utilisateur = await this.prisma.utilisateur.create({
      data: {
        ...createUtilisateurDto,
        motDePasse: hashedPassword,  // Mot de passe haché
      },
    });

    // Logique pour gérer les rôles des utilisateurs
    if (utilisateur.role === 'EMPLOYE') {
      const responsable = await this.prisma.responsable.findFirst({
        where: { typeResponsable: 'CHEF_EQUIPE' },
      });

      if (!responsable) {
        throw new Error('Aucun responsable CHEF_EQUIPE trouvé.');
      }

      await this.prisma.employe.create({
        data: {
          utilisateur: { connect: { id: utilisateur.id } },
          responsable: { connect: { id: responsable.id } },
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

  // Récupérer tous les utilisateurs
  async findAll() {
    return this.prisma.utilisateur.findMany();
  }

  // Récupérer un utilisateur par ID
  async findOne(id: string) {
    return this.prisma.utilisateur.findUnique({
      where: { id },
    });
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
    return this.prisma.utilisateur.delete({
      where: { id },
    });
  }
}
