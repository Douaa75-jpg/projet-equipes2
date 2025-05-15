// notifications.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway
  ) {}

  async createAndSendNotification(data: {
    message: string;
    userId?: string;
    responsableId?: string;
    type?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        message: data.message,
        employeId: data.userId,
        responsableId: data.responsableId,
        type: data.type,
      },
    });

    // إرسال الإشعار عبر WebSocket
    if (data.userId) {
      this.notificationsGateway.sendNotificationToUser(data.userId, notification);
    }
    if (data.responsableId) {
      this.notificationsGateway.sendNotificationToUser(data.responsableId, notification);
    }

    return notification;
  }
}