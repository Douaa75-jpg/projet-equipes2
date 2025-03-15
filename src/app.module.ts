import { Module } from '@nestjs/common';
import { AdministrateurModule } from './administrateur/administrateur.module';
import { EmployeModule } from './employe/employe.module';
import { UtilisateursModule } from './utilisateur/utilisateur.module';
import { ResponsableModule } from './responsable/responsable.module';
import { PointageModule } from './pointage/pointage.module';
import { DemandeModule } from './demande/demande.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AdministrateurModule,
    EmployeModule,
    UtilisateursModule,
    ResponsableModule,
    PointageModule,
    DemandeModule,
    AuthModule,
  ],
})
export class AppModule {}
