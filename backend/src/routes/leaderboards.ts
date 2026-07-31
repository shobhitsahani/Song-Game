import { Router, Request, Response } from 'express';

const router = Router();

router.get('/global', async (_req: Request, res: Response) => {
  const { getLeaderboard } = await import('../services/leaderboard.service');
  const leaderboard = await getLeaderboard('GLOBAL');
  res.json(leaderboard);
});

router.get('/xp', async (_req: Request, res: Response) => {
  const { getLeaderboard } = await import('../services/leaderboard.service');
  const leaderboard = await getLeaderboard('XP');
  res.json(leaderboard);
});

router.get('/wins', async (_req: Request, res: Response) => {
  const { getTopWins } = await import('../services/leaderboard.service');
  const leaderboard = await getTopWins();
  res.json(leaderboard);
});

router.get('/accuracy', async (_req: Request, res: Response) => {
  const { getTopAccuracy } = await import('../services/leaderboard.service');
  const leaderboard = await getTopAccuracy();
  res.json(leaderboard);
});

export default router;
