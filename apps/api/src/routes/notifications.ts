import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
  deleteNotification,
} from '../services/notification.service.js';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response) => {
  const notifications = await getNotifications(req.userId!);
  res.json({ success: true, data: notifications });
});

router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  const count = await getUnreadCount(req.userId!);
  res.json({ success: true, data: { count } });
});

router.post('/:id/read', authenticate, async (req: Request, res: Response) => {
  await markNotificationRead(req.params.id as string, req.userId!);
  res.json({ success: true });
});

router.post('/read-all', authenticate, async (req: Request, res: Response) => {
  await markAllNotificationsRead(req.userId!);
  res.json({ success: true });
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  await deleteNotification(req.params.id as string, req.userId!);
  res.json({ success: true });
});

export default router;
