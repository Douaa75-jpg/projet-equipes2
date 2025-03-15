import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';

@Injectable()
export class DemandeService {
  constructor(private prisma: PrismaService) {}

  async create(createDemandeDto: CreateDemandeDto) {
    return this.prisma.demande.create({
      data: createDemandeDto,
    });
  }

  async findAll() {
    return this.prisma.demande.findMany();
  }

  async findOne(id: string) {
    return this.prisma.demande.findUnique({ where: { id } });
  }

  async update(id: string, updateDemandeDto: UpdateDemandeDto) {
    return this.prisma.demande.update({
      where: { id },
      data: updateDemandeDto,
    });
  }

  async remove(id: string) {
    return this.prisma.demande.delete({ where: { id } });
  }
}
