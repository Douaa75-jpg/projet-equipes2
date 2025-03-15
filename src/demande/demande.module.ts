import { Module } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { DemandeController } from './demande.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DemandeController],
  providers: [DemandeService, PrismaService],
})
export class DemandeModule {}
