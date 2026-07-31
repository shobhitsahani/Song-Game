const DEEZER_API_BASE = 'https://api.deezer.com';

export interface DeezerTrack {
  id: number;
  title: string;
  title_short: string;
  artist: { id: number; name: string };
  album: { id: number; title: string; cover_medium: string; cover_big: string; cover_xl: string };
  preview: string;
  duration: number;
  rank: number;
}

interface DeezerSearchResult {
  data: DeezerTrack[];
  total: number;
  next?: string;
}

async function deezerGet<T>(path: string, params?: Record<string, string | number>): Promise<T | null> {
  const url = new URL(`${DEEZER_API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }
  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function searchTracks(query: string, limit = 25, order?: string): Promise<DeezerTrack[]> {
  const params: Record<string, string | number> = { q: query, limit };
  if (order) params.order = order;
  const res = await deezerGet<DeezerSearchResult>('/search', params);
  return res?.data || [];
}

export async function searchTracksByYear(year: number, limit = 25): Promise<DeezerTrack[]> {
  const res = await deezerGet<DeezerSearchResult>('/search', { q: `year:${year}`, order: 'RANKING', limit });
  return res?.data || [];
}

export async function searchChart(limit = 25): Promise<DeezerTrack[]> {
  const res = await deezerGet<{ data: DeezerTrack[] }>('/chart/0/tracks', { limit });
  return res?.data || [];
}

export async function searchCountryChart(countryCode: string, limit = 25): Promise<DeezerTrack[]> {
  const res = await deezerGet<{ data: DeezerTrack[] }>(`/chart/${countryCode}/tracks`, { limit });
  return res?.data || [];
}

export async function searchByGenre(genreId: number, limit = 25): Promise<DeezerTrack[]> {
  const res = await deezerGet<{ data: DeezerTrack[] }>('/search', { q: `genre:${genreId}`, limit });
  return res?.data || [];
}

const GENRE_MAP: Record<string, number> = {
  pop: 132,
  rock: 152,
  'hip-hop': 116,
  electronic: 106,
  'r&b': 165,
  country: 153,
  countryside: 153,
  jazz: 129,
  classical: 107,
  reggae: 144,
  metal: 464,
  indie: 132,
  latin: 149,
};

export function getGenreId(category: string): number | undefined {
  return GENRE_MAP[category.toLowerCase()];
}
