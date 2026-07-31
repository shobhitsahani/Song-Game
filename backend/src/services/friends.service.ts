import { PrismaClient } from '@prisma/client';
import { getRedis } from '../redis';
import { getPrisma } from '../database';

function getPrismaClient(): PrismaClient {
  try { return getPrisma(); } catch { return new PrismaClient(); }
}

async function sendNotification(prisma: PrismaClient, userId: string, type: string, title: string, message: string, data?: any) {
  try {
    await prisma.notification.create({
      data: { userId, type: type as any, title, message, data: data || {} },
    });
  } catch {} // notification failure is non-critical
}

export async function sendFriendRequest(userId: string, friendId: string) {
  const prisma = getPrismaClient();
  if (userId === friendId) throw new Error('Cannot add yourself');

  const existing = await prisma.friend.findUnique({
    where: { userId_friendId: { userId, friendId } },
    select: { status: true },
  });
  if (existing) throw new Error(existing.status === 'BLOCKED' ? 'Cannot send request' : 'Request already exists');

  const friend = await prisma.friend.create({
    data: { userId, friendId, status: 'PENDING' },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  await sendNotification(prisma, friendId, 'FRIEND_REQUEST', 'Friend Request', `${user?.username} sent you a friend request`, { userId });

  return friend;
}

export async function acceptFriendRequest(userId: string, friendId: string) {
  const prisma = getPrismaClient();
  const request = await prisma.friend.findUnique({
    where: { userId_friendId: { userId: friendId, friendId: userId } },
    select: { status: true },
  });
  if (!request || request.status !== 'PENDING') throw new Error('No pending request');

  await prisma.friend.update({
    where: { userId_friendId: { userId: friendId, friendId: userId } },
    data: { status: 'ACCEPTED' },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  await sendNotification(prisma, friendId, 'FRIEND_ACCEPT', 'Friend Request Accepted', `${user?.username} accepted your friend request`, { userId });

  return { success: true };
}

export async function rejectFriendRequest(userId: string, friendId: string) {
  const prisma = getPrismaClient();
  await prisma.friend.delete({
    where: { userId_friendId: { userId: friendId, friendId: userId } },
  });
  return { success: true };
}

export async function removeFriend(userId: string, friendId: string) {
  const prisma = getPrismaClient();
  await prisma.friend.deleteMany({
    where: { OR: [{ userId, friendId }, { userId: friendId, friendId: userId }] },
  });
  return { success: true };
}

export async function blockUser(userId: string, blockedId: string) {
  const prisma = getPrismaClient();
  await prisma.friend.upsert({
    where: { userId_friendId: { userId, friendId: blockedId } },
    update: { status: 'BLOCKED' },
    create: { userId, friendId: blockedId, status: 'BLOCKED' },
  });
  return { success: true };
}

export async function getFriends(userId: string) {
  const prisma = getPrismaClient();
  const redis = getRedis();
  const cacheKey = `friends:list:${userId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const friends = await prisma.friend.findMany({
    where: { OR: [{ userId }, { friendId: userId }], status: 'ACCEPTED' },
    select: {
      userId: true, friendId: true, createdAt: true,
      user: { select: { id: true, username: true, avatar: true, xp: true, level: true } },
      friend: { select: { id: true, username: true, avatar: true, xp: true, level: true } },
    },
  });

  const onlineStatuses = await Promise.all(
    friends.map(f => {
      const id = f.userId === userId ? f.friendId : f.userId;
      return redis.get(`user:online:${id}`).then(r => ({ id, online: !!r })).catch(() => ({ id, online: false }));
    })
  );
  const onlineMap = new Map(onlineStatuses.map(s => [s.id, s.online]));

  const result = friends.map((f) => {
    const friend = f.userId === userId ? f.friend : f.user;
    return {
      id: friend.id, username: friend.username, avatar: friend.avatar,
      xp: friend.xp, level: friend.level,
      isOnline: onlineMap.get(friend.id) || false, since: f.createdAt,
    };
  });

  await redis.setex(cacheKey, 30, JSON.stringify(result)).catch(() => {});
  return result;
}

export async function getPendingRequests(userId: string) {
  const prisma = getPrismaClient();
  return prisma.friend.findMany({
    where: { friendId: userId, status: 'PENDING' },
    select: {
      createdAt: true,
      user: { select: { id: true, username: true, avatar: true, xp: true, level: true } },
    },
  });
}

export async function getRecentTeammates(userId: string) {
  const prisma = getPrismaClient();
  return prisma.recentTeammate.findMany({
    where: { userId },
    orderBy: { lastPlayed: 'desc' },
    take: 20,
    select: { teammate: { select: { id: true, username: true, avatar: true, xp: true, level: true } } },
  });
}

export async function addFavoritePlayer(userId: string, targetId: string) {
  const prisma = getPrismaClient();
  return prisma.favoritePlayer.upsert({
    where: { userId_targetId: { userId, targetId } },
    update: {},
    create: { userId, targetId },
  });
}

export async function removeFavoritePlayer(userId: string, targetId: string) {
  const prisma = getPrismaClient();
  await prisma.favoritePlayer.deleteMany({ where: { userId, targetId } });
}

export async function getFavoritePlayers(userId: string) {
  const prisma = getPrismaClient();
  return prisma.favoritePlayer.findMany({
    where: { userId },
    select: { target: { select: { id: true, username: true, avatar: true, xp: true, level: true } } },
  });
}

export async function getMutualFriends(userId: string, targetId: string) {
  const prisma = getPrismaClient();
  const [userFriendIds, targetFriendIds] = await Promise.all([
    prisma.friend.findMany({ where: { userId, status: 'ACCEPTED' }, select: { friendId: true } }),
    prisma.friend.findMany({ where: { userId: targetId, status: 'ACCEPTED' }, select: { friendId: true } }),
  ]);

  const userSet = new Set(userFriendIds.map(f => f.friendId));
  const mutualIds = targetFriendIds.filter(f => userSet.has(f.friendId)).map(f => f.friendId);

  return prisma.user.findMany({
    where: { id: { in: mutualIds } },
    select: { id: true, username: true, avatar: true },
  });
}

export async function isUserOnline(userId: string): Promise<boolean> {
  const redis = getRedis();
  const socketId = await redis.get(`user:online:${userId}`).catch(() => null);
  return !!socketId;
}

export async function setUserOnline(userId: string, socketId: string) {
  const redis = getRedis();
  await redis.set(`user:online:${userId}`, socketId, 'EX', 300).catch(() => {});
}

export async function setUserOffline(userId: string) {
  const redis = getRedis();
  await redis.del(`user:online:${userId}`).catch(() => {});
}
