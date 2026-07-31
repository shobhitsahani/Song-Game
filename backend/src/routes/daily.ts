import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function getUserId(req: Request): string | null {
  try {
    const token = req.cookies?.token;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch { return null; }
}

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const { getDailyChallenge } = await import('../services/daily.service');
  const challenge = await getDailyChallenge(userId);
  res.json(challenge);
});

router.post('/score', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const { submitDailyScore } = await import('../services/daily.service');
  try {
    const result = await submitDailyScore(userId, req.body.score);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/claim', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const { claimDailyReward } = await import('../services/daily.service');
  try {
    const result = await claimDailyReward(userId);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/leaderboard', async (_req: Request, res: Response) => {
  const { getDailyLeaderboard } = await import('../services/daily.service');
  const leaderboard = await getDailyLeaderboard();
  res.json(leaderboard);
});

router.get('/streak', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const { getDailyStreak } = await import('../services/daily.service');
  const streak = await getDailyStreak(userId);
  res.json({ streak });
});

export default router;
