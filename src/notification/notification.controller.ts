import { Controller, Post, Body } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications') // Étiquette pour Swagger
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  @Post()
  sendNotification(
    @Body() body: { responsableId: string; message: string },
  ) {
    this.notificationGateway.sendNotification(body.responsableId, body.message);
    return { message: 'Notification envoyée' };
  }
}
