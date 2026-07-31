import { PrismaClient } from '@prisma/client';
import { getPrisma } from '../database';

function getPrismaClient(): PrismaClient {
  try { return getPrisma(); } catch { return new PrismaClient(); }
}

export async function sendNotification(
  prismaInput: PrismaClient | null,
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: any
) {
  const prisma = prismaInput || getPrismaClient();
  try {
    await prisma.notification.create({
      data: { userId, type: type as any, title, message, data: data || {} },
    });
  } catch {} // notification failure is non-critical
}

export async function getNotifications(userId: string, page = 1, limit = 20) {
  const prisma = getPrismaClient();
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const prisma = getPrismaClient();
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markAsRead(notificationId: string, userId: string) {
  const prisma = getPrismaClient();
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  const prisma = getPrismaClient();
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function deleteNotification(notificationId: string, userId: string) {
  const prisma = getPrismaClient();
  await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
}
