import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createForEmploye(employeId: string, message: string) {
    return this.prisma.notification.create({
      data: {
        message,
        employeId,
      },
    });
  }

  async createForResponsable(responsableId: string, message: string) {
    return this.prisma.notification.create({
      data: {
        message,
        responsableId,
      },
    });
  }

  async markAsRead(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundException('Notification introuvable');

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { lu: true },
    });
  }

  async getForEmploye(employeId: string) {
    return this.prisma.notification.findMany({
      where: { employeId },
      orderBy: { dateEnvoi: 'desc' },
    });
  }

  async getForResponsable(responsableId: string) {
    return this.prisma.notification.findMany({
      where: { responsableId },
      orderBy: { dateEnvoi: 'desc' },
    });
  }

  async delete(notificationId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }
}
