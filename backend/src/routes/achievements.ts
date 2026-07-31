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
  const { getAllAchievements } = await import('../services/achievements.service');
  const achievements = await getAllAchievements();
  res.json(achievements);
});

router.get('/mine', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const { getUserAchievements } = await import('../services/achievements.service');
  const achievements = await getUserAchievements(userId);
  res.json(achievements);
});

router.get('/progress', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const { getAchievementProgress } = await import('../services/achievements.service');
  const progress = await getAchievementProgress(userId);
  res.json(progress);
});

export default router;
