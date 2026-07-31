'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/providers/auth-provider';
import { SocketProvider } from '@/providers/socket-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SocketProvider>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1e1e3a',
              border: '1px solid #2a2a4a',
              color: '#f8f8ff',
            },
          }}
        />
      </SocketProvider>
    </AuthProvider>
  );
}
