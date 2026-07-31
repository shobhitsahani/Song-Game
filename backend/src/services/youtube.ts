import axios from 'axios';

interface YouTubeSearchResult {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { high: { url: string } };
    description: string;
  };
}

interface SongData {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  lyrics?: string;
  album?: string;
  decade?: string;
}

export async function searchSong(query: string): Promise<SongData | null> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return getFallbackSong();

    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 5,
        videoCategoryId: '10',
        key: apiKey,
      },
    });

    const items: YouTubeSearchResult[] = res.data.items;
    if (!items?.length) return getFallbackSong();

    const item = items[Math.floor(Math.random() * items.length)];
    const title = cleanTitle(item.snippet.title);

    const lyrics = extractLyrics(item.snippet.description);

    return {
      videoId: item.id.videoId,
      title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.high?.url || '',
      lyrics,
    };
  } catch (error) {
    console.error('YouTube API error:', error);
    return getFallbackSong();
  }
}

export async function searchSongWithLyrics(query: string): Promise<SongData | null> {
  const song = await searchSong(query);
  if (!song) return null;

  if (!song.lyrics) {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (apiKey) {
        const res = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails',
            id: song.videoId,
            key: apiKey,
          },
        });

        const video = res.data.items?.[0];
        if (video?.snippet?.description) {
          song.lyrics = extractLyrics(video.snippet.description);
        }
      }
    } catch (error) {
      console.error('YouTube lyrics fetch error:', error);
    }
  }

  return song;
}

function extractLyrics(description: string): string | undefined {
  if (!description) return undefined;

  const lyricsSection = description.match(/(?:lyrics|words|chords)[\s\S]*?\n\n([\s\S]+?)(?:\n\n|\n*$)/i);
  if (lyricsSection && lyricsSection[1]) {
    const lines = lyricsSection[1].split('\n').filter(l => l.trim().length > 0);
    if (lines.length >= 3) {
      return lines.slice(0, 8).join('\n');
    }
  }

  const lines = description.split('\n').filter(l => l.trim().length > 0);
  if (lines.length >= 5) {
    const potentialLyrics = lines.slice(2, Math.min(10, lines.length)).join('\n');
    if (!potentialLyrics.toLowerCase().includes('subscribe') &&
        !potentialLyrics.toLowerCase().includes('click') &&
        !potentialLyrics.includes('http')) {
      return potentialLyrics;
    }
  }

  return undefined;
}

function cleanTitle(title: string): string {
  return title
    .replace(/\(.*?official.*?\)/gi, '')
    .replace(/\[.*?official.*?\]/gi, '')
    .replace(/\(.*?audio.*?\)/gi, '')
    .replace(/\[.*?audio.*?\]/gi, '')
    .replace(/\(.*?video.*?\)/gi, '')
    .replace(/\[.*?video.*?\]/gi, '')
    .replace(/\(.*?lyrics.*?\)/gi, '')
    .replace(/\[.*?lyrics.*?\]/gi, '')
    .replace(/\(.*?hd.*?\)/gi, '')
    .replace(/\[.*?hd.*?\]/gi, '')
    .trim();
}

function getFallbackSong(): SongData {
  const fallbacks: SongData[] = [
    { videoId: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
    { videoId: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg' },
    { videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg' },
    { videoId: 'OPf0YbXqDm0', title: 'Uptown Funk', artist: 'Mark Ronson', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg' },
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
