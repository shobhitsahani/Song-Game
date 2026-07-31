import { create } from 'zustand';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, token: null, isAuthenticated: false, isLoading: true,
  initialize: async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/me`, { credentials: 'include' });
      if (res.ok) { const user = await res.json(); set({ user, isAuthenticated: true, isLoading: false }); }
      else { set({ isLoading: false }); }
    } catch { set({ isLoading: false }); }
  },
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => { document.cookie = 'token=; max-age=0'; set({ user: null, token: null, isAuthenticated: false }); },
}));