// C:\projet-equipes\src\notification\notification.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notifications.service';
import { NotificationGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post()
async sendNotification(@Body() body: CreateNotificationDto) {
  if (!body.responsableId) {
    throw new Error('Le responsableId est requis');
  }

  // Créer la notification dans la base de données
  const notification = await this.notificationService.create(body);
  
  // Envoyer la notification via WebSocket
  this.notificationGateway.sendNotification(
    body.responsableId,
    body.message,
  );

  return { message: 'Notification envoyée et enregistrée', notification };
}
}
