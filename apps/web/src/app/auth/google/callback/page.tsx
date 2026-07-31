'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const userStr = searchParams.get('user');

    if (error || !token) {
      router.push('/?error=auth_failed');
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        setUser(user);
      } catch {
        // fallback: fetch me
      }
    }

    router.push('/');
  }, [searchParams, router, setUser]);

  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Suspense fallback={
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Completing sign in...</p>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </main>
  );
}
