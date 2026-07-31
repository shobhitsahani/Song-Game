'use client';
import { ReactNode, lazy, Suspense } from 'react';
import { UserProvider } from '@/providers/UserProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { Toaster } from '@/components/ui/toast';
import { InstallPrompt } from '@/components/shared/InstallPrompt';
import { BottomNav } from '@/components/shared/BottomNav';

const LoadingScreen = lazy(() =>
  import('@/components/shared/loading-screen').then(module => ({ default: module.LoadingScreen })),
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <SocketProvider>
        <Suspense fallback={<LoadingScreen message="Initializing app..." />}>
          {children}
          <Toaster />
          <InstallPrompt />
          <BottomNav />
        </Suspense>
      </SocketProvider>
    </UserProvider>
  );
}
