import { prisma } from '../config/database.js';
import { getRedis } from '../config/redis.js';
import type { Friend, FriendRequest } from '@song-game/types';

export async function sendFriendRequest(userId: string, friendId: string) {
  if (userId === friendId) throw new Error('Cannot add yourself');

  const existing = await prisma.friend.findUnique({
    where: { userId_friendId: { userId, friendId } },
  });
  if (existing) throw new Error(existing.status === 'BLOCKED' ? 'Cannot send request' : 'Request already exists');

  await prisma.friend.create({
    data: { userId, friendId, status: 'PENDING' },
  });
}

export async function acceptFriendRequest(userId: string, friendId: string) {
  const request = await prisma.friend.findUnique({
    where: { userId_friendId: { userId: friendId, friendId: userId } },
  });
  if (!request || request.status !== 'PENDING') throw new Error('No pending request');

  await prisma.friend.update({
    where: { userId_friendId: { userId: friendId, friendId: userId } },
    data: { status: 'ACCEPTED' },
  });
}

export async function rejectFriendRequest(userId: string, friendId: string) {
  await prisma.friend.delete({
    where: { userId_friendId: { userId: friendId, friendId: userId } },
  });
}

export async function removeFriend(userId: string, friendId: string) {
  await prisma.friend.deleteMany({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });
}

export async function getFriends(userId: string): Promise<Friend[]> {
  const redis = getRedis();
  const cacheKey = `friends:list:${userId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const friends = await prisma.friend.findMany({
    where: {
      OR: [{ userId }, { friendId: userId }],
      status: 'ACCEPTED',
    },
    select: {
      userId: true,
      friendId: true,
      createdAt: true,
      user: { select: { id: true, username: true, avatar: true, xp: true, level: true } },
      friend: { select: { id: true, username: true, avatar: true, xp: true, level: true } },
    },
  });

  const result: Friend[] = friends.map(
    (f: {
      userId: string;
      friendId: string;
      createdAt: Date;
      user: { id: string; username: string; avatar: string | null; xp: number; level: number };
      friend: { id: string; username: string; avatar: string | null; xp: number; level: number };
    }) => {
      const friend = f.userId === userId ? f.friend : f.user;
      return {
        id: friend.id,
        username: friend.username,
        avatar: friend.avatar,
        xp: friend.xp,
        level: friend.level,
        isOnline: false,
        since: f.createdAt.toISOString(),
      };
    },
  );

  await redis.setex(cacheKey, 30, JSON.stringify(result)).catch(() => {});
  return result;
}

export async function getPendingRequests(userId: string): Promise<FriendRequest[]> {
  const requests = await prisma.friend.findMany({
    where: { friendId: userId, status: 'PENDING' },
    select: {
      createdAt: true,
      user: { select: { id: true, username: true, avatar: true, xp: true, level: true } },
    },
  });

  return requests.map(
    (r: {
      createdAt: Date;
      user: { id: string; username: string; avatar: string | null; xp: number; level: number };
    }) => ({
      id: r.user.id,
      username: r.user.username,
      avatar: r.user.avatar,
      xp: r.user.xp,
      level: r.user.level,
      createdAt: r.createdAt.toISOString(),
    }),
  );
}

export async function setUserOnline(userId: string, socketId: string): Promise<void> {
  const redis = getRedis();
  await redis.set(`user:online:${userId}`, socketId, 'EX', 300).catch(() => {});
}

export async function setUserOffline(userId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`user:online:${userId}`).catch(() => {});
}

export async function isUserOnline(userId: string): Promise<boolean> {
  const redis = getRedis();
  const result = await redis.get(`user:online:${userId}`).catch(() => null);
  return !!result;
}
