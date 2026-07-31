import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from '../services/friend.service.js';
import { sendNotification } from '../services/notification.service.js';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const friends = await getFriends(req.userId!);
  res.json({ success: true, data: friends });
});

router.get('/requests', authenticate, async (req: Request, res: Response) => {
  const requests = await getPendingRequests(req.userId!);
  res.json({ success: true, data: requests });
});

router.post('/request/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await sendFriendRequest(req.userId!, req.params.id as string);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.post('/accept/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await acceptFriendRequest(req.userId!, req.params.id as string);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.post('/reject/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await rejectFriendRequest(req.userId!, req.params.id as string);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await removeFriend(req.userId!, req.params.id as string);
    res.json({ success: true });
  } catch {
    res.status(400).json({ success: false, error: 'Failed to remove friend' });
  }
});

export default router;
