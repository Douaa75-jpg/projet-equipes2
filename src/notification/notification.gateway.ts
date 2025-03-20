import {
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  
  @WebSocketGateway({ cors: true }) // يسمح بالوصول عبر CORS
  export class NotificationGateway {
    @WebSocketServer()
    server: Server;
  
    sendNotification(responsableId: string, message: string) {
      this.server.emit(`notification_${responsableId}`, { message });
    }
  }
  