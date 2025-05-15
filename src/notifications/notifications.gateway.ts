import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  private rhRoom = 'rh-room';

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.userId);
    
    // Si l'utilisateur est RH, le joindre à la room RH
    if (this.isRhUser(data.userId)) {
      client.join(this.rhRoom);
    }
    
    console.log(`User ${data.userId} joined rooms.`);
  }

  private isRhUser(userId: string): boolean {
    // Implémentez la logique pour vérifier si l'utilisateur est RH
    // Par exemple, vérifier dans la base de données
    return false; // À remplacer par votre logique
  }

  sendNotificationToUser(userId: string, payload: any) {
    this.server.to(userId).emit('notification', {
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  sendNotificationToRh(payload: any) {
    this.server.to(this.rhRoom).emit('notification', {
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }
}