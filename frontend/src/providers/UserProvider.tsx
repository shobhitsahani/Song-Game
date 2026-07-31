'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '@/types';
import { api } from '@/lib/api';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  error: null,
  login: () => {},
  logout: async () => {},
  refresh: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const data = await api.auth.me();
      setUser(data);
      setError(null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = useCallback(() => api.auth.deezerLogin(), []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, error, login, logout, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
