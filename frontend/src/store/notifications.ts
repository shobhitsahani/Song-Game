'use client';

import { create } from 'zustand';
import type { Notification } from '@/types';
import { api } from '@/lib/api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadNotifications: () => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  loadNotifications: async () => {
    set({ loading: true });
    try {
      const data = await api.notifications.list();
      set({ notifications: data, loading: false });
      await get().loadUnreadCount();
    } catch {
      set({ loading: false });
    }
  },

  loadUnreadCount: async () => {
    try {
      const { count } = await api.notifications.unreadCount();
      set({ unreadCount: count });
    } catch {}
  },

  markRead: async (id) => {
    await api.notifications.markRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await api.notifications.markAllRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  deleteNotification: async (id) => {
    await api.notifications.delete(id);
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
