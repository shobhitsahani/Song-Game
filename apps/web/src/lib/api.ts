import type {
  SafeUser,
  UserStats,
  Friend,
  FriendRequest,
  LeaderboardEntry,
  AppNotification,
} from '@song-game/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${path}`, config);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  /* COMMENTED: auth endpoints — backend dependency removed
  auth: {
    me: () => request<{ success: boolean; data: any }>('/auth/me'),
    guest: () => request<{ success: boolean; data: any }>('/auth/guest', { method: 'POST' }),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    googleLogin: () => { window.location.href = `${API_URL}/auth/google`; },
  },
  */
  auth: {},
  users: {
    profile: () => request<{ success: boolean; data: SafeUser }>('/users/profile'),
    stats: () => request<{ success: boolean; data: UserStats }>('/users/stats'),
  },
  friends: {
    list: () => request<{ success: boolean; data: Friend[] }>('/friends'),
    requests: () => request<{ success: boolean; data: FriendRequest[] }>('/friends/requests'),
    sendRequest: (id: string) => request<{ success: boolean }>(`/friends/request/${id}`, { method: 'POST' }),
    acceptRequest: (id: string) => request<{ success: boolean }>(`/friends/accept/${id}`, { method: 'POST' }),
    rejectRequest: (id: string) => request<{ success: boolean }>(`/friends/reject/${id}`, { method: 'POST' }),
    remove: (id: string) => request<{ success: boolean }>(`/friends/${id}`, { method: 'DELETE' }),
  },
  leaderboard: {
    list: (period: string = 'weekly') => request<{ success: boolean; data: LeaderboardEntry[] }>(`/leaderboard?period=${period}`),
  },
  notifications: {
    list: () => request<{ success: boolean; data: AppNotification[] }>('/notifications'),
    unreadCount: () => request<{ success: boolean; data: { count: number } }>('/notifications/unread-count'),
    markRead: (id: string) => request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => request<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),
  },
};
