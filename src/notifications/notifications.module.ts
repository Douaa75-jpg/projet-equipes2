import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { NotificationController } from './notifications.controller';
import { NotificationGateway } from './notifications.gateway';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importer TypeOrmModule
import { Notification } from './entities/notification.entity'; // Importer l'entité Notification
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]), // Enregistrer l'entité Notification avec TypeORM
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway , PrismaService],
  exports: [NotificationGateway],
})
export class NotificationModule {}
