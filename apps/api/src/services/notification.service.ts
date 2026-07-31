import { prisma } from '../config/database.js';
import { getRedis } from '../config/redis.js';
import type { NotificationType, AppNotification } from '@song-game/types';

export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>,
): Promise<AppNotification> {
  const notification = await prisma.notification.create({
    data: { userId, type, title, message, data: (data as any) || {} },
  });

  return {
    id: notification.id,
    type: notification.type as NotificationType,
    title: notification.title,
    message: notification.message,
    data: (notification.data as Record<string, unknown>) || {},
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
  };
}

export async function getNotifications(userId: string, limit = 50): Promise<AppNotification[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return notifications.map((n) => ({
    id: n.id,
    type: n.type as NotificationType,
    title: n.title,
    message: n.message,
    data: (n.data as Record<string, unknown>) || {},
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function deleteNotification(notificationId: string, userId: string): Promise<void> {
  await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
}
