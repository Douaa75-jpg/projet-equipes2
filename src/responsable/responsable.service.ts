import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class ResponsableService {
  constructor(private prisma: PrismaService) {}

  // Créer un responsable
  async create(createResponsableDto: CreateResponsableDto) {
    // Générer un sel et hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createResponsableDto.motDePasse, salt);

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

  // Trouver tous les responsables
  async findAll() {
    return this.prisma.responsable.findMany({
      select: { // Sélectionner uniquement id et typeResponsable
        id: true,
        typeResponsable: true,
      },
    });
  }

  // Trouver un responsable par ID
  async findOne(id: string) {
    return this.prisma.responsable.findUnique({
      where: { id },
      select: { // Sélectionner uniquement id et typeResponsable
        id: true,
        typeResponsable: true,
      },
    });
  }

  // Mettre à jour un responsable
  async update(id: string, updateResponsableDto: UpdateResponsableDto) {
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
    return this.prisma.responsable.delete({
      where: { id },
    });
  }
}
