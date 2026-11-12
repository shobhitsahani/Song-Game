'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { MotionConfig } from 'motion/react';
import { AuthProvider } from '@/providers/auth-provider';
import { SocketProvider } from '@/providers/socket-provider';
import { ThemeProvider } from '@/components/glass/theme-switcher';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{
                className: 'liquid-glass-surface rounded-2xl text-[var(--foreground)] border-[var(--glass-border)] text-sm shadow-xl',
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
