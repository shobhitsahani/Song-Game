'use client';

import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
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
            <Toaster position="bottom-center" />
          </SocketProvider>
        </AuthProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
