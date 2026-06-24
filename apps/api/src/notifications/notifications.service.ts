import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private expo   = new Expo();
  private logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  // Enregistrer le token push d'un utilisateur
  async registerToken(userId: string, token: string) {
    if (!Expo.isExpoPushToken(token)) {
      this.logger.warn(`Token invalide pour l'utilisateur ${userId}: ${token}`);
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data:  { pushToken: token },
    });

    this.logger.log(`Token enregistré pour ${userId}`);
  }

  // Envoyer une notification à un utilisateur
  async sendToUser(userId: string, title: string, body: string, data?: object) {
    const user = await this.prisma.user.findUnique({
      where:  { id: userId },
      select: { pushToken: true },
    });

    if (!user?.pushToken) return;
    if (!Expo.isExpoPushToken(user.pushToken)) return;

    const message: ExpoPushMessage = {
      to:    user.pushToken,
      sound: 'default',
      title,
      body,
      data: (data as Record<string, unknown>) ?? {},
    };

    try {
      const chunks   = this.expo.chunkPushNotifications([message]);
      const tickets  = [];
      for (const chunk of chunks) {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }
      this.logger.log(`Notification envoyée à ${userId}`);
    } catch (error) {
      this.logger.error('Erreur envoi notification:', error);
    }
  }

  // Notifier le citoyen quand son signalement change de statut
  async notifyStatusChange(
    reportId:   string,
    userId:     string,
    newStatus:  string,
    comment?:   string,
  ) {
    const statusLabels: Record<string, string> = {
      NEW:         'Nouveau',
      IN_PROGRESS: 'En cours de traitement',
      RESOLVED:    'Résolu ✅',
    };

    const label = statusLabels[newStatus] ?? newStatus;
    const body  = comment
      ? `Statut : ${label}\n💬 ${comment}`
      : `Votre signalement est maintenant : ${label}`;

    await this.sendToUser(
      userId,
      '📍 Mise à jour de votre signalement',
      body,
      { reportId, status: newStatus },
    );
  }
}
