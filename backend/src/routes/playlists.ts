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

function getAccessToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const accessToken = getAccessToken(req);
  if (!accessToken) return res.status(401).json({ message: 'Deezer access token required' });

  const query = req.query.q as string;
  if (!query) return res.status(400).json({ message: 'Search query required' });

  const { searchPlaylists } = await import('../services/playlist.service');
  const playlists = await searchPlaylists(query, accessToken);
  res.json(playlists);
});

router.post('/import/:playlistId', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const accessToken = getAccessToken(req);
  if (!accessToken) return res.status(401).json({ message: 'Deezer access token required' });

  const { importPlaylist } = await import('../services/playlist.service');
  const playlist = await importPlaylist(userId, req.params.playlistId, accessToken);
  res.json(playlist);
});

router.get('/', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const { getUserPlaylists } = await import('../services/playlist.service');
  const playlists = await getUserPlaylists(userId);
  res.json(playlists);
});

router.get('/favorites', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const { getFavoritePlaylists } = await import('../services/playlist.service');
  const playlists = await getFavoritePlaylists(userId);
  res.json(playlists);
});

router.post('/:playlistId/favorite', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const { toggleFavoritePlaylist } = await import('../services/playlist.service');
  const playlist = await toggleFavoritePlaylist(userId, req.params.playlistId);
  res.json(playlist);
});

router.delete('/:playlistId', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  const { removePlaylist } = await import('../services/playlist.service');
  await removePlaylist(userId, req.params.playlistId);
  res.json({ success: true });
});

export default router;
