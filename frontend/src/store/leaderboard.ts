import { create } from 'zustand';
import { api } from '@/lib/api';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardState {
  global: LeaderboardEntry[];
  xp: LeaderboardEntry[];
  wins: LeaderboardEntry[];
  accuracy: LeaderboardEntry[];
  friends: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  loading: boolean;
  loadGlobal: () => Promise<void>;
  loadXP: () => Promise<void>;
  loadWins: () => Promise<void>;
  loadAccuracy: () => Promise<void>;
  loadFriends: () => Promise<void>;
  loadWeekly: () => Promise<void>;
  loadMonthly: () => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  global: [],
  xp: [],
  wins: [],
  accuracy: [],
  friends: [],
  weekly: [],
  monthly: [],
  loading: false,

  loadGlobal: async () => {
    set({ loading: true });
    try {
      const data = await api.leaderboards.global();
      set({ global: data, loading: false });
    } catch { set({ loading: false }); }
  },

  loadXP: async () => {
    try {
      const data = await api.leaderboards.xp();
      set({ xp: data });
    } catch {}
  },

  loadWins: async () => {
    try {
      const data = await api.leaderboards.wins();
      set({ wins: data });
    } catch {}
  },

  loadAccuracy: async () => {
    try {
      const data = await api.leaderboards.accuracy();
      set({ accuracy: data });
    } catch {}
  },

  loadFriends: async () => {
    try {
      const data = await api.leaderboards.friends();
      set({ friends: data });
    } catch {}
  },

  loadWeekly: async () => {
    try {
      const data = await api.leaderboards.weekly();
      set({ weekly: data });
    } catch {}
  },

  loadMonthly: async () => {
    try {
      const data = await api.leaderboards.monthly();
      set({ monthly: data });
    } catch {}
  },
}));
