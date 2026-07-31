import { PrismaClient, LeaderboardType } from '@prisma/client';
import { getRedis } from '../redis';
import { getPrisma } from '../database';

const CACHE_TTL = 60;

function getPrismaClient(): PrismaClient {
  try { return getPrisma(); } catch { return new PrismaClient(); }
}

export async function updateLeaderboard(userId: string) {
  const prisma = getPrismaClient();
  const redis = getRedis();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, xp: true, wins: true, accuracy: true },
  });
  if (!user) return;

  const updates = [
    upsertEntry(prisma, userId, 'GLOBAL' as LeaderboardType, user.xp, null),
    upsertEntry(prisma, userId, 'XP' as LeaderboardType, user.xp, null),
    upsertEntry(prisma, userId, 'WINS' as LeaderboardType, user.wins, null),
    upsertEntry(prisma, userId, 'ACCURACY' as LeaderboardType, Math.round(user.accuracy * 100), null),
  ];

  await Promise.all(updates);
  await Promise.all([
    redis.del('leaderboard:GLOBAL').catch(() => {}),
    redis.del('leaderboard:XP').catch(() => {}),
    redis.del('leaderboard:WINS').catch(() => {}),
    redis.del('leaderboard:ACCURACY').catch(() => {}),
  ]);
}

async function upsertEntry(prisma: PrismaClient, userId: string, type: LeaderboardType, score: number, period: string | null) {
  const existing = await prisma.leaderboardEntry.findUnique({
    where: { userId_type: { userId, type } },
  });

  if (existing) {
    await prisma.leaderboardEntry.update({
      where: { id: existing.id },
      data: { score, period, updatedAt: new Date() },
    });
  } else {
    await prisma.leaderboardEntry.create({
      data: { userId, type, score, rank: 0, period },
    });
  }
}

export async function getLeaderboard(type: string = 'GLOBAL', limit = 50): Promise<any[]> {
  const prisma = getPrismaClient();
  const redis = getRedis();
  const cacheKey = `leaderboard:${type}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const entries = await prisma.leaderboardEntry.findMany({
    where: { type: type as LeaderboardType },
    orderBy: { score: 'desc' },
    take: limit,
  });

  const userIds = entries.map(e => e.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, avatar: true, xp: true, level: true, title: true, border: true, wins: true },
  });
  const userMap = new Map(users.map(u => [u.id, u]));

  const result = entries.map((e, i) => {
    const u = userMap.get(e.userId);
    return {
      rank: i + 1, id: e.userId,
      username: u?.username || 'Unknown',
      avatar: u?.avatar || null,
      xp: u?.xp || 0, level: u?.level || 1,
      title: u?.title || null, border: u?.border || null,
      wins: u?.wins || 0, score: e.score,
    };
  });

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
  return result;
}

export async function getFriendsLeaderboard(userId: string, limit = 50): Promise<any[]> {
  const prisma = getPrismaClient();
  const redis = getRedis();
  const cacheKey = `leaderboard:friends:${userId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const friends = await prisma.friend.findMany({
    where: { OR: [{ userId }, { friendId: userId }], status: 'ACCEPTED' },
    select: { userId: true, friendId: true },
  });

  const friendIds = friends.map(f => f.userId === userId ? f.friendId : f.userId);
  friendIds.push(userId);

  const entries = await prisma.leaderboardEntry.findMany({
    where: { type: 'GLOBAL', userId: { in: friendIds } },
    orderBy: { score: 'desc' },
    take: limit,
  });

  const users = await prisma.user.findMany({
    where: { id: { in: entries.map(e => e.userId) } },
    select: { id: true, username: true, avatar: true, xp: true, level: true, title: true },
  });
  const userMap = new Map(users.map(u => [u.id, u]));

  const result = entries.map((e, i) => {
    const u = userMap.get(e.userId);
    return {
      rank: i + 1, id: e.userId,
      username: u?.username || 'Unknown',
      avatar: u?.avatar || null, xp: u?.xp || 0,
      level: u?.level || 1, title: u?.title || null,
      score: e.score,
    };
  });

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
  return result;
}

export async function getUserRank(userId: string, type: LeaderboardType = 'GLOBAL'): Promise<{ rank: number; total: number } | null> {
  const prisma = getPrismaClient();
  const entry = await prisma.leaderboardEntry.findUnique({
    where: { userId_type: { userId, type } },
    select: { score: true },
  });
  if (!entry) return null;

  const [higher, total] = await Promise.all([
    prisma.leaderboardEntry.count({ where: { type, score: { gt: entry.score } } }),
    prisma.leaderboardEntry.count({ where: { type } }),
  ]);

  return { rank: higher + 1, total };
}

export async function getTopAccuracy(limit = 50) {
  const prisma = getPrismaClient();
  const redis = getRedis();
  const cacheKey = 'leaderboard:top-accuracy';
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const result = await prisma.user.findMany({
    where: { totalGames: { gte: 10 } },
    orderBy: { accuracy: 'desc' },
    take: limit,
    select: { id: true, username: true, avatar: true, level: true, accuracy: true, totalGames: true },
  });

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
  return result;
}

export async function getTopWins(limit = 50) {
  const prisma = getPrismaClient();
  const redis = getRedis();
  const cacheKey = 'leaderboard:top-wins';
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);

  const result = await prisma.user.findMany({
    orderBy: { wins: 'desc' },
    take: limit,
    select: { id: true, username: true, avatar: true, level: true, wins: true, totalGames: true },
  });

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
  return result;
}
