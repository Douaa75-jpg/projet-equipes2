import { Module } from '@nestjs/common';
import { EmployeService } from './employe.service';
import { EmployeController } from './employe.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ResponsableModule } from '../responsable/responsable.module';
import { JwtModule } from '@nestjs/jwt';  // Importer JwtModule


@Module({
  imports: [
    ResponsableModule,
  ],
  controllers: [EmployeController],
  providers: [EmployeService, PrismaService],  // Assure-toi d'ajouter le guard ici
  exports: [EmployeService],
})
export class EmployeModule {}
