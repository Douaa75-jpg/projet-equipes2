import { Module } from '@nestjs/common';
import { UtilisateursService } from './utilisateur.service';
import { UtilisateursController } from './utilisateur.controller';
import { PrismaService } from 'src/prisma/prisma.service'; // Ajoutez le service Prisma
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from '../mail/mailer.service';
import { CustomMailerModule } from '../mail/mailer.module';
@Module({
  imports: [CustomMailerModule],
  controllers: [UtilisateursController],
  providers: [UtilisateursService, PrismaService],
  exports: [UtilisateursService], 
})
export class UtilisateursModule {}
