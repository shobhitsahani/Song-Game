import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { NotFoundError, ConflictError } from '../utils/errors';

export default function friendRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get('/', authenticate, async (req: Request, res: Response) => {
    const { getFriends } = await import('../services/friends.service');
    const friends = await getFriends(req.user!.userId);
    res.json(friends);
  });

  router.get('/requests', authenticate, async (req: Request, res: Response) => {
    const { getPendingRequests } = await import('../services/friends.service');
    const requests = await getPendingRequests(req.user!.userId);
    res.json(requests);
  });

  router.post('/request/:id', authenticate, async (req: Request, res: Response) => {
    const { sendFriendRequest } = await import('../services/friends.service');
    try {
      const result = await sendFriendRequest(req.user!.userId, req.params.id);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  router.post('/accept/:id', authenticate, async (req: Request, res: Response) => {
    const { acceptFriendRequest } = await import('../services/friends.service');
    await acceptFriendRequest(req.user!.userId, req.params.id);
    res.json({ success: true });
  });

  router.post('/reject/:id', authenticate, async (req: Request, res: Response) => {
    const { rejectFriendRequest } = await import('../services/friends.service');
    await rejectFriendRequest(req.user!.userId, req.params.id);
    res.json({ success: true });
  });

  router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    const { removeFriend } = await import('../services/friends.service');
    await removeFriend(req.user!.userId, req.params.id);
    res.json({ success: true });
  });

  router.get('/teammates', authenticate, async (req: Request, res: Response) => {
    const { getRecentTeammates } = await import('../services/friends.service');
    const teammates = await getRecentTeammates(req.user!.userId);
    res.json(teammates);
  });

  router.get('/favorites', authenticate, async (req: Request, res: Response) => {
    const { getFavoritePlayers } = await import('../services/friends.service');
    const favorites = await getFavoritePlayers(req.user!.userId);
    res.json(favorites);
  });

  router.post('/favorites/:id', authenticate, async (req: Request, res: Response) => {
    const { addFavoritePlayer } = await import('../services/friends.service');
    await addFavoritePlayer(req.user!.userId, req.params.id);
    res.json({ success: true });
  });

  router.delete('/favorites/:id', authenticate, async (req: Request, res: Response) => {
    const { removeFavoritePlayer } = await import('../services/friends.service');
    await removeFavoritePlayer(req.user!.userId, req.params.id);
    res.json({ success: true });
  });

  router.get('/mutual/:userId', authenticate, async (req: Request, res: Response) => {
    const { getMutualFriends } = await import('../services/friends.service');
    const mutual = await getMutualFriends(req.user!.userId, req.params.userId);
    res.json(mutual);
  });

  return router;
}
