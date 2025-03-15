import { Module } from '@nestjs/common';
import { AdministrateurService } from './administrateur.service';
import { AdministrateurController } from './administrateur.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AdministrateurController],
  providers: [AdministrateurService, PrismaService],
})
export class AdministrateurModule {}
