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
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'douaae159@gmail.com', // ✅ تأكد فيه . قبل com
          pass: 'gycm fcdl isgw jxcq',
        },
      },
      defaults: {
        from: '"ZETABOX" <no-reply@zetabox.com>',
      },
      template: {
        dir: join(process.cwd(), 
                  process.env.NODE_ENV === 'development' ? 'src' : 'dist', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }), // Charge le fichier .env
    ScheduleModule.forRoot(),
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
