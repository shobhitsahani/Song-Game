import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getRedis } from '../redis';
import { authenticate } from '../middleware/auth';

const CACHE_TTL = 30;

export default function userRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get('/profile', authenticate, async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const redis = getRedis();
    const cacheKey = `user:profile:${userId}`;

    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(JSON.parse(cached));
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, deezerId: true, username: true, email: true,
        avatar: true, xp: true, level: true, title: true, border: true,
        wins: true, totalGames: true, accuracy: true, fastestAnswer: true,
        winStreak: true, longestWinStreak: true,
        createdAt: true, updatedAt: true,
        achievements: {
          select: { id: true, type: true, title: true, description: true, icon: true, rarity: true, xpReward: true, unlockedAt: true },
          orderBy: { unlockedAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(user)).catch(() => {});
    res.setHeader('X-Cache', 'MISS');
    res.json(user);
  });

  router.get('/stats', authenticate, async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const redis = getRedis();
    const cacheKey = `user:stats:${userId}`;

    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(JSON.parse(cached));
      return;
    }

    const [games, achievements, userData] = await Promise.all([
      prisma.gamePlayer.findMany({
        where: { userId },
        select: { id: true, rank: true, correctAnswers: true, totalAnswers: true, avgResponseTime: true },
      }),
      prisma.achievement.findMany({
        where: { userId },
        select: { id: true, type: true, title: true, description: true, icon: true, rarity: true, xpReward: true, unlockedAt: true },
        orderBy: { unlockedAt: 'desc' },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, totalGames: true, wins: true, accuracy: true },
      }),
    ]);

    const totalGames = games.length;
    const wins = games.filter(g => g.rank === 1).length;
    const correctAnswers = games.reduce((sum, g) => sum + g.correctAnswers, 0);
    const totalAnswers = games.reduce((sum, g) => sum + g.totalAnswers, 0);
    const totalResponseTime = games.reduce((sum, g) => sum + g.avgResponseTime * g.totalAnswers, 0);

    const recentGames = await prisma.game.findMany({
      where: { players: { some: { userId } } },
      select: {
        id: true, roomCode: true, mode: true, status: true, createdAt: true,
        players: { select: { id: true, username: true, avatar: true, score: true, rank: true }, orderBy: { score: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const result = {
      totalGames, wins,
      winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
      xp: userData?.xp || 0, correctAnswers, totalAnswers,
      accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
      avgResponseTime: totalAnswers > 0 ? totalResponseTime / totalAnswers : 0,
      recentGames, achievements,
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
    res.setHeader('X-Cache', 'MISS');
    res.json(result);
  });

  router.get('/xp-history', authenticate, async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const [txns, total] = await Promise.all([
      prisma.xPTransaction.findMany({
        where: { userId },
        select: { id: true, amount: true, reason: true, metadata: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.xPTransaction.count({ where: { userId } }),
    ]);

    res.json({ data: txns, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });

  router.get('/achievements', authenticate, async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      select: { id: true, type: true, title: true, description: true, icon: true, rarity: true, xpReward: true, unlockedAt: true },
      orderBy: { unlockedAt: 'desc' },
    });
    res.json(achievements);
  });

  return router;
}
