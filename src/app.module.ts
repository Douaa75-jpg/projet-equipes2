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
import { NotificationModule } from './notifications/notifications.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Charge le fichier .env
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, // Utilise la variable d'environnement
      autoLoadEntities: true,
      synchronize: true, // ⚠️ Ne pas utiliser en production !
    }),
    AdministrateurModule,
    EmployeModule,
    UtilisateursModule,
    ResponsableModule,
    PointageModule,
    DemandeModule,
    AuthModule,
    TacheModule,
    NotificationModule,
  ],
})
export class AppModule {}
