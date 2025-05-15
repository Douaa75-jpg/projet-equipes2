import { Module } from '@nestjs/common';
import { DemandeService } from './demande.service';
import { DemandeController } from './demande.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationModule } from '../notifications/notifications.module'; 
@Module({
  imports: [NotificationModule],
  controllers: [DemandeController],
  providers: [DemandeService, PrismaService ],
})
export class DemandeModule {}
