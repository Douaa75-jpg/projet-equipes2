import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdministrateurDto } from './dto/create-administrateur.dto';

@Injectable()
export class AdministrateurService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdministrateurDto: CreateAdministrateurDto) {
    return this.prisma.administrateur.create({
      data: {
        utilisateur: {
          connect: { id: createAdministrateurDto.utilisateurId },  // Relier l'administrateur à un utilisateur existant
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.administrateur.findUnique({
      where: { id },
      include: { utilisateur: true },
    });
  }
}
