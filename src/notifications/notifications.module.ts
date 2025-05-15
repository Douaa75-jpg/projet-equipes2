import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { NotificationController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importer TypeOrmModule
import { Notification } from './entities/notification.entity'; // Importer l'entité Notification
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]), // Enregistrer l'entité Notification avec TypeORM
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationsGateway , PrismaService],
  exports: [NotificationsGateway, NotificationService],
})
export class NotificationModule {}
