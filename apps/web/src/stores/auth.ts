import { create } from 'zustand';
import type { SafeUser } from '@song-game/types';

interface AuthState {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  loginWithGoogle: () => void;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: SafeUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    set({ isLoading: false });
  },

  loginWithGoogle: () => {},
  loginAsGuest: async () => {},
  logout: async () => {},

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
