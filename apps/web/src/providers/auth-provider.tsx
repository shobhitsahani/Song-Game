'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth';

/*
 * AuthProvider — now auto-authenticates as guest on mount.
 * The store's initialize() sets a mock guest user
 * instead of reading httpOnly cookies and calling /auth/me.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
