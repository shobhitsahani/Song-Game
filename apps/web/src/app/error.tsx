'use client';

import { useEffect } from 'react';
import { Warning, ArrowClockwise, House } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { GlassSurface } from '@/components/glass/glass-surface';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('App runtime error:', error);
  }, [error]);

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center p-4">
      <GlassSurface
        variant="strong"
        radius="xl"
        className="max-w-md w-full p-8 text-center shadow-2xl backdrop-blur-2xl"
      >
        <div className="w-16 h-16 rounded-3xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/25 flex items-center justify-center mx-auto mb-4 text-[var(--destructive)]">
          <Warning size={36} weight="duotone" />
        </div>
        <h1 className="text-2xl font-black font-display tracking-tight text-[var(--foreground)] mb-2">
          Something Hit a Scratch
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          We encountered an unexpected error while rendering this session.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            size="lg"
            className="flex-1 font-bold shadow-lg"
            onClick={() => reset()}
          >
            <ArrowClockwise size={20} weight="bold" /> Try Again
          </Button>
          <Link href="/" className="flex-1">
            <Button variant="glass" size="lg" className="w-full">
              <House size={20} /> Home
            </Button>
          </Link>
        </div>
      </GlassSurface>
    </main>
  );
}
