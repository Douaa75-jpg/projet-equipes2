import { Module } from '@nestjs/common';
import { UtilisateursService } from './utilisateur.service';
import { UtilisateursController } from './utilisateur.controller';
import { PrismaService } from 'src/prisma/prisma.service'; // Ajoutez le service Prisma

@Module({
  controllers: [UtilisateursController],
  providers: [UtilisateursService, PrismaService],
  exports: [UtilisateursService], 
})
export class UtilisateursModule {}
