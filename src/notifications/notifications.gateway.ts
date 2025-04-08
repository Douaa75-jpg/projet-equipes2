import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // Déclarez explicitement que users est un objet avec des clés de type string et des valeurs de type Socket
  private users: { [key: string]: Socket } = {};

  // Lorsqu'un utilisateur se connecte
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      console.warn('❌ userId manquant dans la connexion WebSocket');
      client.disconnect();
      return;
    }
    this.users[userId] = client;
    console.log(`✅ RH connecté via WebSocket : ${userId}`);
  }

  // Lorsqu'un utilisateur se déconnecte
  handleDisconnect(client: Socket) {
    console.log(`Utilisateur déconnecté: ${client.id}`);
    // Supprimez l'utilisateur de la liste des utilisateurs connectés
    for (const userId in this.users) {
      if (this.users[userId] === client) {
        delete this.users[userId];
        console.log(`🗑️ Utilisateur supprimé de la liste : ${userId}`);
        break;
      }
    }
  }

  // Envoi d'une notification à un utilisateur spécifique
  sendNotification(userId: string, message: string) {
    const client = this.users[userId];
    if (client) {
      client.emit('notification', message);
    } else {
      console.warn(` RH (${userId}) non connecté via WebSocket. Notification non envoyée.`);
    }
  }

  // Envoi d'une notification à tous les utilisateurs connectés
  sendNotificationToAll(message: string) {
    this.server.emit('notification', message);
   console.log(` Notification envoyée à tous : ${message}`);
  }
}
