import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../config/database.js';
import { getRedis } from '../config/redis.js';
import { getLevel, getLevelProgress } from '@song-game/shared';
import type { SafeUser, UserStats, GameSummary, Friend, FriendRequest, LeaderboardEntry, Achievement } from '@song-game/types';
import { toSafeUser } from '../services/auth.service.js';
import { getFriends, getPendingRequests } from '../services/friend.service.js';
import { getNotifications } from '../services/notification.service.js';

const router = Router();
const CACHE_TTL = 30;

router.get('/profile', authenticate, async (req: Request, res: Response) => {
  const redis = getRedis();
  const cacheKey = `user:profile:${req.userId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    res.json({ success: true, data: JSON.parse(cached) });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true, email: true, username: true, displayName: true,
      avatar: true, isGuest: true, xp: true, level: true,
      wins: true, totalGames: true, createdAt: true, updatedAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  const safeUser = toSafeUser(user as any);
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(safeUser)).catch(() => {});
  res.json({ success: true, data: safeUser });
});

router.get('/stats', authenticate, async (req: Request, res: Response) => {
  const redis = getRedis();
  const cacheKey = `user:stats:${req.userId}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    res.json({ success: true, data: JSON.parse(cached) });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { xp: true, wins: true, totalGames: true },
  });

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  const levelInfo = getLevelProgress(user.xp);
  const stats: UserStats = {
    totalGames: user.totalGames,
    wins: user.wins,
    winRate: user.totalGames > 0 ? Math.round((user.wins / user.totalGames) * 100) : 0,
    xp: user.xp,
    level: levelInfo.level,
    correctAnswers: 0,
    totalAnswers: 0,
    accuracy: 0,
    avgResponseTime: 0,
    currentStreak: 0,
    longestStreak: 0,
  };

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(stats)).catch(() => {});
  res.json({ success: true, data: stats });
});

router.get('/search', authenticate, async (req: Request, res: Response) => {
  const query = (req.query.q as string)?.trim();
  if (!query || query.length < 2) {
    res.json({ success: true, data: [] });
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { displayName: { contains: query, mode: 'insensitive' } },
      ],
      id: { not: req.userId },
    },
    select: {
      id: true, username: true, displayName: true, avatar: true, level: true,
    },
    take: 20,
  });

  res.json({ success: true, data: users });
});

export default router;
