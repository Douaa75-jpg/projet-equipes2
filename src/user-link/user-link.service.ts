import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserLinkService {
  constructor(private prisma: PrismaService) {}

  async linkUserToPointeuse(userId: string, pointeuseId: number) {
    return this.prisma.utilisateur.update({
      where: { id: userId },
      data: { pointeuseId }
    });
  }

  async getUsersWithPointeuseLinks() {
    return this.prisma.utilisateur.findMany({
      where: { pointeuseId: { not: null } },
      select: { id: true, nom: true, prenom: true, pointeuseId: true }
    });
  }
}