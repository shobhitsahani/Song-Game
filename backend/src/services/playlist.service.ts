import { PrismaClient } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';

const prisma = new PrismaClient();

const DEEZER_BASE = 'https://api.deezer.com';

interface DeezerPlaylist {
  id: number;
  title: string;
  description: string;
  picture_xl: string;
  picture_big: string;
  picture_medium: string;
  nb_tracks: number;
  creator?: { name: string };
}

interface DeezerTrack {
  id: number;
  title: string;
  preview: string;         // 30-sec MP3 URL — free, no auth required
  duration: number;
  artist: { name: string };
  album: {
    title: string;
    cover_xl: string;
    cover_big: string;
  };
}

// ──────────────────────────────────────────────────────
// Search public Deezer playlists
// ──────────────────────────────────────────────────────
export async function searchPlaylists(query: string, accessToken: string, limit = 20) {
  const res = await axios.get(`${DEEZER_BASE}/search/playlist`, {
    params: { q: query, limit, access_token: accessToken },
  });

  return (res.data.data || []).map((p: DeezerPlaylist) => ({
    id: String(p.id),
    name: p.title,
    description: p.description || null,
    image: p.picture_xl || p.picture_big || p.picture_medium || null,
    ownerName: p.creator?.name || 'Deezer User',
    trackCount: p.nb_tracks || 0,
  }));
}

// ──────────────────────────────────────────────────────
// Get all tracks in a playlist (paginated)
// Tracks include a `preview` URL (30-sec MP3, no auth needed)
// ──────────────────────────────────────────────────────
export async function getPlaylistTracks(playlistId: string, accessToken: string) {
  const tracks: DeezerTrack[] = [];
  let url: string | null = `${DEEZER_BASE}/playlist/${playlistId}/tracks?limit=100&access_token=${accessToken}`;

  while (url) {
    const response: AxiosResponse<{ data: DeezerTrack[]; next: string | null }> = await axios.get(url);
    const items: DeezerTrack[] = response.data.data || [];
    tracks.push(...items.filter((t) => t && t.preview)); // only keep tracks with a preview
    // Deezer paginates via `next` field
    url = response.data.next || null;
  }

  return tracks;
}

// ──────────────────────────────────────────────────────
// Import a playlist into our DB
// ──────────────────────────────────────────────────────
export async function importPlaylist(userId: string, playlistId: string, accessToken: string) {
  const res = await axios.get(`${DEEZER_BASE}/playlist/${playlistId}`, {
    params: { access_token: accessToken },
  });

  const p: DeezerPlaylist = res.data;
  if ((p as any).error) throw new Error(`Deezer playlist error: ${(p as any).error.message}`);

  const imageUrl = p.picture_xl || p.picture_big || p.picture_medium || null;

  const playlist = await prisma.userPlaylist.upsert({
    where: { userId_playlistId: { userId, playlistId } },
    update: {
      name: p.title,
      description: p.description || null,
      image: imageUrl,
      ownerName: p.creator?.name || 'Deezer User',
      trackCount: p.nb_tracks || 0,
    },
    create: {
      userId,
      playlistId,
      name: p.title,
      description: p.description || null,
      image: imageUrl,
      ownerName: p.creator?.name || 'Deezer User',
      trackCount: p.nb_tracks || 0,
    },
  });

  return playlist;
}

// ──────────────────────────────────────────────────────
// Get user's own Deezer playlists
// ──────────────────────────────────────────────────────
export async function getUserPlaylists(userId: string) {
  return prisma.userPlaylist.findMany({
    where: { userId },
    orderBy: { importedAt: 'desc' },
  });
}

export async function getFavoritePlaylists(userId: string) {
  return prisma.userPlaylist.findMany({
    where: { userId, isFavorite: true },
    orderBy: { importedAt: 'desc' },
  });
}

export async function toggleFavoritePlaylist(userId: string, playlistId: string) {
  const playlist = await prisma.userPlaylist.findUnique({
    where: { userId_playlistId: { userId, playlistId } },
  });
  if (!playlist) throw new Error('Playlist not found');

  return prisma.userPlaylist.update({
    where: { id: playlist.id },
    data: { isFavorite: !playlist.isFavorite },
  });
}

export async function removePlaylist(userId: string, playlistId: string) {
  await prisma.userPlaylist.deleteMany({
    where: { userId, playlistId },
  });
}

// ──────────────────────────────────────────────────────
// Recently played — fallback to DB (Deezer doesn't expose this freely)
// ──────────────────────────────────────────────────────
export async function getRecentlyPlayedPlaylists(userId: string, _accessToken: string) {
  try {
    return prisma.userPlaylist.findMany({
      where: { userId },
      orderBy: { importedAt: 'desc' },
      take: 10,
    });
  } catch {
    return [];
  }
}
