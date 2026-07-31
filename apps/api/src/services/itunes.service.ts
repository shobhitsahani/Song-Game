import type { DeezerTrack } from './deezer.service.js';

const ITUNES_API_BASE = 'https://itunes.apple.com';

const ITUNES_GENRE_MAP: Record<string, number> = {
  pop: 14,
  rock: 21,
  'hip-hop': 18,
  electronic: 17,
  'r&b': 15,
  country: 6,
  countryside: 6,
  jazz: 11,
  classical: 5,
  reggae: 24,
  metal: 115,
  indie: 20,
  latin: 19,
};

export function getItunesGenreId(category: string): number | undefined {
  return ITUNES_GENRE_MAP[category.toLowerCase()];
}

function bumpArtwork(url: string): string {
  return url.replace(/\/\d+x\d+bb\.(jpg|png)$/, '/600x600bb.jpg');
}

interface ItunesSearchResult {
  resultCount: number;
  results: {
    trackId: number;
    trackName: string;
    artistName: string;
    collectionName?: string;
    artworkUrl100?: string;
    previewUrl?: string;
    trackTimeMillis?: number;
  }[];
}

interface ItunesRssEntry {
  'im:name': { label: string };
  'im:artist'?: { label: string };
  'im:collection'?: { 'im:name'?: { label: string } };
  'im:image': { label: string }[];
  id: { attributes: { 'im:id': string } };
  link: {
    attributes: { title?: string; href?: string; 'im:assetType'?: string };
  }[];
}

interface ItunesRssFeed {
  feed: { entry?: ItunesRssEntry[] };
}

async function itunesGet<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function toDeezerTrack(t: ItunesSearchResult['results'][number]): DeezerTrack | null {
  if (!t.previewUrl || !t.trackName || !t.artistName) return null;
  return {
    id: t.trackId,
    title: t.trackName,
    title_short: t.trackName,
    artist: { id: 0, name: t.artistName },
    album: {
      id: 0,
      title: t.collectionName || t.trackName,
      cover_medium: bumpArtwork(t.artworkUrl100 || ''),
      cover_big: bumpArtwork(t.artworkUrl100 || ''),
      cover_xl: bumpArtwork(t.artworkUrl100 || ''),
    },
    preview: t.previewUrl,
    duration: Math.round((t.trackTimeMillis || 30000) / 1000),
    rank: 0,
  };
}

export async function searchItunes(query: string, limit = 25): Promise<DeezerTrack[]> {
  const url = `${ITUNES_API_BASE}/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`;
  const res = await itunesGet<ItunesSearchResult>(url);
  if (!res) return [];
  return res.results
    .map(toDeezerTrack)
    .filter((t): t is DeezerTrack => t !== null);
}

function rssEntryToTrack(entry: ItunesRssEntry): DeezerTrack | null {
  const previewLink = entry.link?.find(
    (l) => l.attributes?.title === 'Preview' && l.attributes?.['im:assetType'] === 'preview'
  );
  const title = entry['im:name']?.label;
  const artist = entry['im:artist']?.label;
  if (!previewLink?.attributes.href || !title || !artist) return null;

  const image = entry['im:image']?.[2]?.label || entry['im:image']?.[0]?.label || '';
  const album = entry['im:collection']?.['im:name']?.label || title;

  return {
    id: Number(entry.id.attributes['im:id']) || 0,
    title,
    title_short: title,
    artist: { id: 0, name: artist },
    album: {
      id: 0,
      title: album,
      cover_medium: bumpArtwork(image),
      cover_big: bumpArtwork(image),
      cover_xl: bumpArtwork(image),
    },
    preview: previewLink.attributes.href,
    duration: 30,
    rank: 0,
  };
}

export async function getItunesTopSongs(genreId?: number, limit = 50, country = 'us'): Promise<DeezerTrack[]> {
  const genrePath = genreId ? `/genre=${genreId}` : '';
  const url = `${ITUNES_API_BASE}/${country}/rss/topsongs${genrePath}/limit=${limit}/json`;
  const res = await itunesGet<ItunesRssFeed>(url);
  if (!res?.feed?.entry) return [];
  return res.feed.entry
    .map(rssEntryToTrack)
    .filter((t): t is DeezerTrack => t !== null);
}
