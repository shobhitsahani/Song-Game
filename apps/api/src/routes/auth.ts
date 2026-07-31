/*
 * Auth routes commented out — requires PostgreSQL + JWT + Redis.
 * Restore when backend infrastructure is set up.
 *
 * import { Router, Request, Response } from 'express';
 * import { z } from 'zod';
 * import { authenticate } from '../middleware/auth.js';
 * import { generateTokens, refreshTokens, findOrCreateGoogleUser, createGuestUser, logout, getMe } from '../services/auth.service.js';
 * import { env } from '../config/env.js';
 */

import { Router, Request, Response } from 'express';

const router = Router();

/*
const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await getMe(req.userId!);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }
  res.json({ success: true, data: user });
});

router.post('/guest', async (_req: Request, res: Response) => {
  try {
    const result = await createGuestUser();
    res.cookie('accessToken', result.tokens.accessToken, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', result.tokens.refreshToken, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create guest account' });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await refreshTokens(refreshToken);
    res.cookie('accessToken', result.tokens.accessToken, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', result.tokens.refreshToken, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, data: result });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (refreshToken) {
    await logout(refreshToken).catch(() => {});
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true });
});

router.get('/google', (_req: Request, res: Response) => {
  const params = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: env.GOOGLE_CALLBACK_URL, response_type: 'code', scope: 'openid email profile', access_type: 'offline', prompt: 'consent' });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') { res.redirect(`${env.FRONTEND_URL}/auth?error=no_code`); return; }
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: env.GOOGLE_CALLBACK_URL, grant_type: 'authorization_code' }) });
    const tokenData: any = await tokenResponse.json();
    if (!tokenData.access_token) { res.redirect(`${env.FRONTEND_URL}/auth?error=token_failed`); return; }
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    const profile: any = await profileResponse.json();
    const result = await findOrCreateGoogleUser({ id: profile.id, email: profile.email, displayName: profile.name, avatar: profile.picture || null });
    res.cookie('accessToken', result.tokens.accessToken, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', result.tokens.refreshToken, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect(`${env.FRONTEND_URL}/?login=success`);
  } catch (error) {
    console.error('[Google Auth Error]', error);
    res.redirect(`${env.FRONTEND_URL}/auth?error=server_error`);
  }
});
*/

router.use((_req: Request, res: Response) => {
  /* COMMENTED: Auth routes disabled */
  res.status(503).json({ success: false, error: 'Auth disabled — set up PostgreSQL + .env to restore' });
});

export default router;
