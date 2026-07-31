import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Friend, FriendRequest } from '@/types';

interface FriendState {
  friends: Friend[];
  requests: FriendRequest[];
  loading: boolean;
  loadFriends: () => Promise<void>;
  loadRequests: () => Promise<void>;
  sendRequest: (userId: string) => Promise<void>;
  acceptRequest: (userId: string) => Promise<void>;
  rejectRequest: (userId: string) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  setOnline: (userId: string, online: boolean) => void;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  requests: [],
  loading: false,

  loadFriends: async () => {
    set({ loading: true });
    try {
      const data = await api.friends.list();
      set({ friends: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadRequests: async () => {
    try {
      const data = await api.friends.requests();
      set({ requests: data });
    } catch {}
  },

  sendRequest: async (userId) => {
    await api.friends.sendRequest(userId);
  },

  acceptRequest: async (userId) => {
    await api.friends.accept(userId);
    set((state) => ({
      requests: state.requests.filter((r) => r.userId !== userId),
    }));
    get().loadFriends();
  },

  rejectRequest: async (userId) => {
    await api.friends.reject(userId);
    set((state) => ({
      requests: state.requests.filter((r) => r.userId !== userId),
    }));
  },

  removeFriend: async (userId) => {
    await api.friends.remove(userId);
    set((state) => ({
      friends: state.friends.filter((f) => f.userId !== userId),
    }));
  },

  setOnline: (userId, online) => {
    set((state) => ({
      friends: state.friends.map((f) =>
        f.userId === userId ? { ...f, isOnline: online } : f
      ),
    }));
  },
}));
