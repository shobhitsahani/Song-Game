import Redis from 'ioredis';
import { getRedis } from '../config/redis.js';
import { searchTracks, searchChart, searchCountryChart, searchByGenre, searchTracksByYear, getGenreId, type DeezerTrack } from './deezer.service.js';
import { searchItunes, getItunesTopSongs, getItunesGenreId } from './itunes.service.js';

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

async function getCached<T>(redis: Redis, key: string): Promise<T[] | null> {
  if (redis.status !== 'ready') return null;
  try {
    const cached = await redis.get(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T[];
      } catch {
        return null;
      }
    }
  } catch {
    // Redis unavailable — fall through to live fetch
  }
  return null;
}

async function setCached(redis: Redis, key: string, value: unknown, ttl: number): Promise<void> {
  if (redis.status !== 'ready') return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch {
    // Redis unavailable — caching is best effort
  }
}

const TRENDING_MAP: Record<string, { deezerCode: string; itunesCountry: string }> = {
  'trending-english': { deezerCode: 'US', itunesCountry: 'us' },
  'trending-india': { deezerCode: 'IN', itunesCountry: 'in' },
};

const DECADE_YEARS: Record<string, number[]> = {
  'hits-2020s': [2020, 2021, 2022, 2023, 2024, 2025, 2026],
  'hits-2010-26': [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
};

async function getYearSongs(years: number[], limit: number): Promise<DeezerTrack[]> {
  const perYear = Math.ceil(limit / years.length);
  const results = await Promise.all(years.map((y) => searchTracksByYear(y, perYear)));
  const seen = new Set<number>();
  return results
    .flat()
    .filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    })
    .slice(0, limit);
}

async function getSongsByCategory(category: string, limit = 50): Promise<SongData[]> {
  const redis = getRedis();
  const cacheKey = `deezer:category:${category}:${limit}`;
  const isChart = category in TRENDING_MAP || category === 'tiktok';

  const cached = await getCached<SongData>(redis, cacheKey);
  if (cached) return cached;

  const trending = TRENDING_MAP[category];
  const genreId = getGenreId(category);
  const decadeYears = DECADE_YEARS[category];
  let tracks: DeezerTrack[] = [];
  if (decadeYears) {
    tracks = await getYearSongs(decadeYears, limit);
  } else if (category === 'hits-2015') {
    tracks = await searchTracksByYear(2015, limit);
  } else if (category === 'tiktok') {
    tracks = await searchTracks('tiktok viral songs', limit, 'RANKING');
    if (tracks.length === 0) {
      tracks = await searchChart(limit);
    }
  } else if (trending) {
    tracks = await searchCountryChart(trending.deezerCode, limit);
  } else if (genreId) {
    tracks = await searchByGenre(genreId, limit);
  } else if (category !== 'any') {
    tracks = await searchTracks(category, limit);
  } else {
    tracks = await searchChart(limit);
  }

  if (tracks.length === 0) {
    if (category === 'hits-2020s' || category === 'hits-2010-26') {
      tracks = await searchItunes('2010s hits', limit);
    } else if (category === 'hits-2015') {
      tracks = await searchItunes('2015 hits', limit);
    } else if (category === 'tiktok') {
      tracks = await getItunesTopSongs(undefined, limit);
    } else if (trending) {
      tracks = await getItunesTopSongs(undefined, limit, trending.itunesCountry);
    } else {
      const itunesGenreId = getItunesGenreId(category);
      if (itunesGenreId) {
        tracks = await getItunesTopSongs(itunesGenreId, limit);
      } else if (category !== 'any') {
        tracks = await searchItunes(category, limit);
      } else {
        tracks = await getItunesTopSongs(undefined, limit);
      }
    }
  }

  const songs = tracks.map(trackToSongData);
  if (songs.length > 0) {
    await setCached(redis, cacheKey, songs, isChart ? CACHE_TTL_CHART : CACHE_TTL_SONGS);
  }
  return songs;
}

async function getCharts(limit = 50): Promise<SongData[]> {
  const redis = getRedis();
  const cacheKey = `deezer:chart:${limit}`;

  const cached = await getCached<SongData>(redis, cacheKey);
  if (cached) return cached;

  let tracks = await searchChart(limit);
  if (tracks.length === 0) {
    tracks = await getItunesTopSongs(undefined, limit);
  }

  const songs = tracks.map(trackToSongData);
  if (songs.length > 0) {
    await setCached(redis, cacheKey, songs, CACHE_TTL_CHART);
  }
  return songs;
}

export async function getRandomSongs(category: string, count: number): Promise<SongData[]> {
  const poolSize = Math.max(count * 5, 50);
  let pool = await getSongsByCategory(category, poolSize);

  if (pool.length < count) {
    const chartSongs = await getCharts(poolSize);
    const existingIds = new Set(pool.map((s) => s.deezerId));
    pool = [...pool, ...chartSongs.filter((s) => !existingIds.has(s.deezerId))];
  }

  const seen = new Set<string>();
  const artistCount = new Map<string, number>();
  const diverse: SongData[] = [];
  for (const song of pool) {
    if ((artistCount.get(song.artist) || 0) >= 2) continue;
    const key = `${song.title.toLowerCase()}|${song.artist.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    artistCount.set(song.artist, (artistCount.get(song.artist) || 0) + 1);
    diverse.push(song);
  }

  const shuffled = diverse.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
