import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';

export default function authRoutes(prisma: PrismaClient, redis: Redis) {
  const router = Router();

  router.get('/deezer/login', (_req: Request, res: Response) => {
    const params = new URLSearchParams({
      app_id: config.DEEZER_APP_ID,
      redirect_uri: config.DEEZER_REDIRECT_URI,
      perms: 'basic_access,email',
      response_type: 'code',
    });
    res.redirect(`https://connect.deezer.com/oauth/auth.php?${params}`);
  });

  router.get('/deezer/callback', async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        return res.redirect(`${config.FRONTEND_URL}/?error=no_code`);
      }

      const tokenRes = await axios.get('https://connect.deezer.com/oauth/access_token.php', {
        params: {
          app_id: config.DEEZER_APP_ID,
          secret: config.DEEZER_APP_SECRET,
          code,
          output: 'json',
        },
        timeout: 10000,
      });

      const { access_token } = tokenRes.data;
      if (!access_token) {
        throw new Error('Failed to get Deezer access token');
      }

      const profileRes = await axios.get('https://api.deezer.com/user/me', {
        params: { access_token },
        timeout: 10000,
      });

      const profile = profileRes.data;
      if (profile.error) {
        throw new Error(`Deezer profile error: ${profile.error.message}`);
      }

      const id = String(profile.id);
      const display_name = profile.name;
      const email = profile.email || null;
      const avatar = profile.picture_xl || profile.picture_big || profile.picture_medium || null;

      let user = await prisma.user.findUnique({ where: { deezerId: id } });

      if (!user) {
        user = await prisma.user.create({
          data: { deezerId: id, username: display_name || `Player${id.slice(0, 6)}`, email, avatar },
        });
      } else {
        user = await prisma.user.update({
          where: { deezerId: id },
          data: { username: display_name, email, avatar },
        });
      }

      const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: '7d' as any });

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      res.redirect(`${config.FRONTEND_URL}/`);
    } catch (error) {
      logger.error('Deezer auth error', { error: String(error) });
      res.redirect(`${config.FRONTEND_URL}/?error=auth_failed`);
    }
  });

  router.get('/me', async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.token;
      if (!token) return res.status(401).json({ message: 'Not authenticated' });

      const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true, deezerId: true, username: true, email: true,
          avatar: true, xp: true, level: true, title: true, border: true,
          wins: true, totalGames: true, accuracy: true, fastestAnswer: true,
          winStreak: true, longestWinStreak: true, createdAt: true, updatedAt: true,
        },
      });
      if (!user) return res.status(401).json({ message: 'User not found' });
      res.json(user);
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  });

  router.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out' });
  });

  return router;
}
