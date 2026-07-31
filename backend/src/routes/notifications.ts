import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../services/notifications.service';

export default function notificationRoutes(prisma: PrismaClient) {
  const router = Router();

  router.get('/', authenticate, async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const result = await getNotifications(req.user!.userId, page, limit);
    res.json(result);
  });

  router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
    const count = await getUnreadCount(req.user!.userId);
    res.json({ count });
  });

  router.post('/:id/read', authenticate, async (req: Request, res: Response) => {
    await markAsRead(req.params.id, req.user!.userId);
    res.json({ success: true });
  });

  router.post('/read-all', authenticate, async (req: Request, res: Response) => {
    await markAllAsRead(req.user!.userId);
    res.json({ success: true });
  });

  router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    await deleteNotification(req.params.id, req.user!.userId);
    res.json({ success: true });
  });

  return router;
}
