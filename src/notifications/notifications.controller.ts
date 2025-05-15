import { Controller, Post, Body, Param, Get, Patch, Delete,} from '@nestjs/common';
import { NotificationService } from './notifications.service';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  // ➕ Envoyer à un employé
  @Post('employe/:id')
  createForEmploye(@Param('id') employeId: string, @Body('message') message: string) {
   
  }

  // ➕ Envoyer à un responsable
  @Post('responsable/:id')
  createForResponsable(@Param('id') responsableId: string, @Body('message') message: string) {
  }

  // ✅ Marquer comme lue
  @Patch('read/:id')
  markAsRead(@Param('id') notificationId: string) {
  }

  // 📥 Récupérer pour un employé
  @Get('employe/:id')
  getForEmploye(@Param('id') employeId: string) {
  }

  // 📥 Récupérer pour un responsable
  @Get('responsable/:id')
  getForResponsable(@Param('id') responsableId: string) {
  }

  // ❌ Supprimer une notification
  @Delete(':id')
  delete(@Param('id') notificationId: string) {
  }
}
