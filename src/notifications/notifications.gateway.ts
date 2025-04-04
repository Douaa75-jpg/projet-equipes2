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
    console.log(`Utilisateur connecté: ${client.id}`);
    // Vous pouvez associer l'ID de l'utilisateur à sa connexion
    const userId = client.handshake.query.userId as string; // Assurez-vous que userId est une string
    if (userId) {
      this.users[userId] = client;
    }
  }

  // Lorsqu'un utilisateur se déconnecte
  handleDisconnect(client: Socket) {
    console.log(`Utilisateur déconnecté: ${client.id}`);
    // Supprimez l'utilisateur de la liste des utilisateurs connectés
    for (const userId in this.users) {
      if (this.users[userId] === client) {
        delete this.users[userId];
        break;
      }
    }
  }

  // Envoi d'une notification à un utilisateur spécifique
  sendNotification(userId: string, message: string) {
    const client = this.users[userId];
    if (client) {
      client.emit('notification', message); // 'notification' est l'événement qui sera capté par le client
    }
  }

  // Envoi d'une notification à tous les utilisateurs connectés
  sendNotificationToAll(message: string) {
    this.server.emit('notification', message);
  }
}
