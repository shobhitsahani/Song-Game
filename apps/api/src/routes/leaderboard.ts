import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { getRedis } from '../config/redis.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as string) || 'weekly';
    const cacheKey = `leaderboard:${period}`;

    const redis = getRedis();
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.json({ success: true, data: JSON.parse(cached) });
      return;
    }

    let dateFilter: Date | null = null;
    const now = new Date();
    if (period === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = weekAgo;
    } else if (period === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = monthAgo;
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        xp: true,
        wins: true,
        totalGames: true,
        level: true,
      },
      orderBy: { xp: 'desc' },
      take: 100,
    });

    const entries = users.map((u) => ({
      userId: u.id,
      username: u.username,
      displayName: u.displayName,
      avatar: u.avatar,
      xp: u.xp,
      wins: u.wins,
      totalGames: u.totalGames,
      level: u.level,
    }));

    const redisClient = getRedis();
    await redisClient.setex(cacheKey, 60, JSON.stringify(entries));
    res.json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
});

export default router;
