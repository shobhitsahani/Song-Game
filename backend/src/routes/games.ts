import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getRedis } from '../redis';
import { authenticate } from '../middleware/auth';

const CACHE_TTL = 15;

export default function gameRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get('/', authenticate, async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const redis = getRedis();
    const cacheKey = `games:recent:${userId}`;

    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.json(JSON.parse(cached));
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where: { players: { some: { userId } } },
        select: {
          id: true, roomCode: true, mode: true, status: true, createdAt: true, endedAt: true,
          players: {
            select: { id: true, username: true, score: true, rank: true, correctAnswers: true, totalAnswers: true },
            orderBy: { score: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.game.count({ where: { players: { some: { userId } } } }),
    ]);

    const result = {
      data: games.map(g => {
        const player = g.players[0];
        return {
          id: g.id, roomCode: g.roomCode, mode: g.mode,
          date: g.createdAt, rank: player?.rank || 0,
          totalPlayers: g.players.length, score: player?.score || 0,
          xpEarned: 0, correctAnswers: player?.correctAnswers || 0,
          totalQuestions: player?.totalAnswers || 0,
        };
      }),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };

    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
    res.setHeader('X-Cache', 'MISS');
    res.json(result);
  });

  router.get('/:id', authenticate, async (req: Request, res: Response) => {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, roomCode: true, mode: true, status: true, createdAt: true, endedAt: true,
        players: {
          select: { id: true, username: true, avatar: true, score: true, rank: true, correctAnswers: true, totalAnswers: true, avgResponseTime: true },
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!game) {
      res.status(404).json({ message: 'Game not found' });
      return;
    }
    res.json(game);
  });

  return router;
}
