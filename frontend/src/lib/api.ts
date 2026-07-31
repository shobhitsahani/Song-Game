const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const requestCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5000;

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const cacheKey = `${options?.method || 'GET'}:${endpoint}`;

  if (!options?.method || options.method === 'GET') {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }
  }

  const res = await fetch(`${API_URL}/api${endpoint}`, {
    headers,
    credentials: 'include',
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  const data = await res.json();

  if (!options?.method || options.method === 'GET') {
    requestCache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL });
    if (requestCache.size > 100) {
      const firstKey = requestCache.keys().next().value;
      if (firstKey) requestCache.delete(firstKey);
    }
  }

  return data as T;
}

export const api = {
  auth: {
    deezerLogin: () => { window.location.href = `${API_URL}/api/auth/deezer/login`; },
    me: () => fetchAPI<any>('/auth/me'),
    logout: () => fetchAPI<any>('/auth/logout'),
  },
  games: {
    list: () => fetchAPI<any[]>('/games'),
    get: (id: string) => fetchAPI<any>(`/games/${id}`),
  },
  users: {
    profile: () => fetchAPI<any>('/users/profile'),
    stats: () => fetchAPI<any>('/users/stats'),
    achievements: () => fetchAPI<any[]>('/users/achievements'),
    xpHistory: () => fetchAPI<any[]>('/users/xp-history'),
  },
  friends: {
    list: () => fetchAPI<any[]>('/friends'),
    requests: () => fetchAPI<any[]>('/friends/requests'),
    sendRequest: (userId: string) => fetchAPI<any>(`/friends/request/${userId}`, { method: 'POST' }),
    accept: (userId: string) => fetchAPI<any>(`/friends/accept/${userId}`, { method: 'POST' }),
    reject: (userId: string) => fetchAPI<any>(`/friends/reject/${userId}`, { method: 'POST' }),
    remove: (userId: string) => fetchAPI<any>(`/friends/${userId}`, { method: 'DELETE' }),
    teammates: () => fetchAPI<any[]>('/friends/teammates'),
    favorites: () => fetchAPI<any[]>('/friends/favorites'),
    addFavorite: (userId: string) => fetchAPI<any>(`/friends/favorites/${userId}`, { method: 'POST' }),
    removeFavorite: (userId: string) => fetchAPI<any>(`/friends/favorites/${userId}`, { method: 'DELETE' }),
  },
  notifications: {
    list: () => fetchAPI<any[]>('/notifications'),
    unreadCount: () => fetchAPI<{ count: number }>('/notifications/unread-count'),
    markRead: (id: string) => fetchAPI<any>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => fetchAPI<any>('/notifications/read-all', { method: 'POST' }),
    delete: (id: string) => fetchAPI<any>(`/notifications/${id}`, { method: 'DELETE' }),
  },
  playlists: {
    search: (q: string) => fetchAPI<any[]>(`/playlists/search?q=${encodeURIComponent(q)}`),
    import: (playlistId: string) => fetchAPI<any>(`/playlists/import/${playlistId}`, { method: 'POST' }),
    list: () => fetchAPI<any[]>('/playlists'),
    favorites: () => fetchAPI<any[]>('/playlists/favorites'),
    toggleFavorite: (playlistId: string) => fetchAPI<any>(`/playlists/${playlistId}/favorite`, { method: 'POST' }),
    remove: (playlistId: string) => fetchAPI<any>(`/playlists/${playlistId}`, { method: 'DELETE' }),
  },
  leaderboards: {
    global: () => fetchAPI<any[]>('/leaderboards/global'),
    xp: () => fetchAPI<any[]>('/leaderboards/xp'),
    wins: () => fetchAPI<any[]>('/leaderboards/wins'),
    accuracy: () => fetchAPI<any[]>('/leaderboards/accuracy'),
    friends: () => fetchAPI<any[]>('/leaderboards/friends'),
    weekly: () => fetchAPI<any[]>('/leaderboards/weekly'),
    monthly: () => fetchAPI<any[]>('/leaderboards/monthly'),
  },
  daily: {
    get: () => fetchAPI<any>('/daily'),
    submitScore: (score: number) => fetchAPI<any>('/daily/score', { method: 'POST', body: JSON.stringify({ score }) }),
    claim: () => fetchAPI<any>('/daily/claim', { method: 'POST' }),
    leaderboard: () => fetchAPI<any[]>('/daily/leaderboard'),
    streak: () => fetchAPI<{ streak: number }>('/daily/streak'),
  },
  achievements: {
    all: () => fetchAPI<any[]>('/achievements'),
    mine: () => fetchAPI<any[]>('/achievements/mine'),
    progress: () => fetchAPI<any[]>('/achievements/progress'),
  },
};
