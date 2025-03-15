import { Module } from '@nestjs/common';
import { EmployeService } from './employe.service';
import { EmployeController } from './employe.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ResponsableModule } from '../responsable/responsable.module';
import { JwtModule } from '@nestjs/jwt';  // Importer JwtModule
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';  // Assure-toi d'importer le guard

@Module({
  imports: [
    ResponsableModule,
    JwtModule.register({
      secret: 'secretKey',  // Remplace avec ta propre clé secrète
      signOptions: { expiresIn: '60m' },  // Expiration du token (60 minutes dans cet exemple)
    }),
  ],
  controllers: [EmployeController],
  providers: [EmployeService, PrismaService, JwtAuthGuard],  // Assure-toi d'ajouter le guard ici
  exports: [EmployeService],
})
export class EmployeModule {}
