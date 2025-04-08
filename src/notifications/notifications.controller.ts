import { Controller, Post, Body, Param, Get, Patch, Delete,} from '@nestjs/common';
import { NotificationService } from './notifications.service';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  // ➕ Envoyer à un employé
  @Post('employe/:id')
  createForEmploye(@Param('id') employeId: string, @Body('message') message: string) {
    return this.notificationService.createForEmploye(employeId, message);
  }

  // ➕ Envoyer à un responsable
  @Post('responsable/:id')
  createForResponsable(@Param('id') responsableId: string, @Body('message') message: string) {
    return this.notificationService.createForResponsable(responsableId, message);
  }

  // ✅ Marquer comme lue
  @Patch('read/:id')
  markAsRead(@Param('id') notificationId: string) {
    return this.notificationService.markAsRead(notificationId);
  }

  // 📥 Récupérer pour un employé
  @Get('employe/:id')
  getForEmploye(@Param('id') employeId: string) {
    return this.notificationService.getForEmploye(employeId);
  }

  // 📥 Récupérer pour un responsable
  @Get('responsable/:id')
  getForResponsable(@Param('id') responsableId: string) {
    return this.notificationService.getForResponsable(responsableId);
  }

  // ❌ Supprimer une notification
  @Delete(':id')
  delete(@Param('id') notificationId: string) {
    return this.notificationService.delete(notificationId);
  }
}
