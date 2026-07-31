import axios from 'axios';

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

export interface DeezerSearchResult {
  data: DeezerTrack[];
  total: number;
  next?: string;
}

export interface DeezerPlaylist {
  id: number;
  title: string;
  description: string;
  nb_tracks: number;
  picture_medium: string;
  user: { name: string };
}

export async function searchTracks(query: string, limit = 25): Promise<DeezerTrack[]> {
  try {
    const res = await axios.get<DeezerSearchResult>(`${DEEZER_API_BASE}/search`, {
      params: { q: query, limit },
      timeout: 5000,
    });
    return res.data.data || [];
  } catch (error) {
    console.error('[Deezer] Search failed:', error);
    return [];
  }
}

export async function getTrack(trackId: number): Promise<DeezerTrack | null> {
  try {
    const res = await axios.get<DeezerTrack>(`${DEEZER_API_BASE}/track/${trackId}`, {
      timeout: 5000,
    });
    return res.data;
  } catch (error) {
    console.error('[Deezer] Track fetch failed:', error);
    return null;
  }
}

export async function searchChart(limit = 25): Promise<DeezerTrack[]> {
  try {
    const res = await axios.get<{ data: DeezerTrack[] }>(`${DEEZER_API_BASE}/chart/0/tracks`, {
      params: { limit },
      timeout: 5000,
    });
    return res.data.data || [];
  } catch (error) {
    console.error('[Deezer] Chart fetch failed:', error);
    return [];
  }
}

export async function searchByGenre(genreId: number, limit = 25): Promise<DeezerTrack[]> {
  try {
    const res = await axios.get<{ data: DeezerTrack[] }>(`${DEEZER_API_BASE}/search`, {
      params: { q: `genre:${genreId}`, limit },
      timeout: 5000,
    });
    return res.data.data || [];
  } catch (error) {
    console.error('[Deezer] Genre search failed:', error);
    return [];
  }
}

const GENRE_MAP: Record<string, number> = {
  pop: 112,
  rock: 152,
  'hip-hop': 116,
  electronic: 106,
  rnb: 165,
  country: 153,
  jazz: 129,
  classical: 107,
  reggae: 144,
  metal: 466,
  indie: 132,
  latin: 149,
};

export function getGenreId(category: string): number | undefined {
  return GENRE_MAP[category.toLowerCase()];
}
