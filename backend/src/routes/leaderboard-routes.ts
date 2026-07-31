import { Router, Request, Response } from 'express';

const router = Router();

router.get('/friends', async (req: Request, res: Response) => {
  const { getFriendsLeaderboard } = await import('../services/leaderboard.service');
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  const leaderboard = await getFriendsLeaderboard(userId);
  res.json(leaderboard);
});

router.get('/weekly', async (req: Request, res: Response) => {
  const { getLeaderboard } = await import('../services/leaderboard.service');
  const leaderboard = await getLeaderboard('WEEKLY');
  res.json(leaderboard);
});

router.get('/monthly', async (req: Request, res: Response) => {
  const { getLeaderboard } = await import('../services/leaderboard.service');
  const leaderboard = await getLeaderboard('MONTHLY');
  res.json(leaderboard);
});

router.get('/country', async (req: Request, res: Response) => {
  const { getLeaderboard } = await import('../services/leaderboard.service');
  const leaderboard = await getLeaderboard('COUNTRY');
  res.json(leaderboard);
});

router.get('/accuracy', async (req: Request, res: Response) => {
  const { getTopAccuracy } = await import('../services/leaderboard.service');
  const leaderboard = await getTopAccuracy();
  res.json(leaderboard);
});

router.get('/wins', async (req: Request, res: Response) => {
  const { getTopWins } = await import('../services/leaderboard.service');
  const leaderboard = await getTopWins();
  res.json(leaderboard);
});

export default router;
