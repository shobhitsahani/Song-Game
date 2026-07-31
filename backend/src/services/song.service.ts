import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import {
  searchTracks,
  searchChart,
  getGenreId,
  type DeezerTrack,
} from './deezer';

const CACHE_TTL_SONGS = 86400;
const CACHE_TTL_CHART = 3600;

export interface SongData {
  id: string;
  deezerId: number;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string;
  duration: number;
}

function trackToSongData(track: DeezerTrack): SongData {
  return {
    id: String(track.id),
    deezerId: track.id,
    title: track.title_short || track.title,
    artist: track.artist.name,
    album: track.album.title,
    albumArt: track.album.cover_xl || track.album.cover_big || track.album.cover_medium,
    previewUrl: track.preview,
    duration: track.duration,
  };
}

export async function searchAndCacheSongs(
  prisma: PrismaClient,
  redis: Redis | null,
  query: string,
  limit = 25
): Promise<SongData[]> {
  const cacheKey = `deezer:search:${query.toLowerCase()}:${limit}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const tracks = await searchTracks(query, limit);
  if (tracks.length === 0) return [];

  const songs = tracks.map(trackToSongData);

  const upserts = songs.map((song) =>
    (prisma as any).song.upsert({
      where: { deezerId: song.deezerId },
      update: {
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumArt: song.albumArt,
        previewUrl: song.previewUrl,
        duration: song.duration,
      },
      create: {
        deezerId: song.deezerId,
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumArt: song.albumArt,
        previewUrl: song.previewUrl,
        duration: song.duration,
      },
    })
  );

  await Promise.allSettled(upserts);

  if (redis) {
    await redis.set(cacheKey, JSON.stringify(songs), 'EX', CACHE_TTL_SONGS);
  }

  return songs;
}

export async function getChartsFromDeezer(
  prisma: PrismaClient,
  redis: Redis | null,
  limit = 50
): Promise<SongData[]> {
  const cacheKey = `deezer:chart:${limit}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const tracks = await searchChart(limit);
  if (tracks.length === 0) return [];

  const songs = tracks.map(trackToSongData);

  const upserts = songs.map((song) =>
    (prisma as any).song.upsert({
      where: { deezerId: song.deezerId },
      update: {
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumArt: song.albumArt,
        previewUrl: song.previewUrl,
        duration: song.duration,
      },
      create: {
        deezerId: song.deezerId,
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumArt: song.albumArt,
        previewUrl: song.previewUrl,
        duration: song.duration,
      },
    })
  );

  await Promise.allSettled(upserts);

  if (redis) {
    await redis.set(cacheKey, JSON.stringify(songs), 'EX', CACHE_TTL_CHART);
  }

  return songs;
}

export async function getSongsByCategory(
  prisma: PrismaClient,
  redis: Redis | null,
  category: string,
  limit = 50
): Promise<SongData[]> {
  const cacheKey = `deezer:category:${category}:${limit}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }

  const genreId = getGenreId(category);
  let tracks: DeezerTrack[];

  if (genreId) {
    const { searchByGenre } = await import('./deezer');
    tracks = await searchByGenre(genreId, limit);
  } else {
    tracks = await searchTracks(category, limit);
  }

  if (tracks.length === 0) return [];

  const songs = tracks.map(trackToSongData);

  const upserts = songs.map((song) =>
    (prisma as any).song.upsert({
      where: { deezerId: song.deezerId },
      update: {
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumArt: song.albumArt,
        previewUrl: song.previewUrl,
        duration: song.duration,
        genre: category,
      },
      create: {
        deezerId: song.deezerId,
        title: song.title,
        artist: song.artist,
        album: song.album,
        albumArt: song.albumArt,
        previewUrl: song.previewUrl,
        duration: song.duration,
        genre: category,
      },
    })
  );

  await Promise.allSettled(upserts);

  if (redis) {
    await redis.set(cacheKey, JSON.stringify(songs), 'EX', CACHE_TTL_SONGS);
  }

  return songs;
}

export async function getRandomSongs(
  prisma: PrismaClient,
  redis: Redis | null,
  category: string,
  count: number
): Promise<SongData[]> {
  const poolSize = Math.max(count * 5, 50);
  let pool = await getSongsByCategory(prisma, redis, category, poolSize);

  if (pool.length < count) {
    const chartSongs = await getChartsFromDeezer(prisma, redis, poolSize);
    const existingIds = new Set(pool.map((s) => s.deezerId));
    const additional = chartSongs.filter((s) => !existingIds.has(s.deezerId));
    pool = [...pool, ...additional];
  }

  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
