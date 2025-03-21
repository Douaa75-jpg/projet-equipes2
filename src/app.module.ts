import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdministrateurModule } from './administrateur/administrateur.module';
import { EmployeModule } from './employe/employe.module';
import { UtilisateursModule } from './utilisateur/utilisateur.module';
import { ResponsableModule } from './responsable/responsable.module';
import { PointageModule } from './pointage/pointage.module';
import { DemandeModule } from './demande/demande.module';
import { AuthModule } from './auth/auth.module';
import { TacheModule } from './tache/tache.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Charge le fichier .env
    AdministrateurModule,
    EmployeModule,
    UtilisateursModule,
    ResponsableModule,
    PointageModule,
    DemandeModule,
    AuthModule,
    TacheModule,
  ],
})
export class AppModule {}
