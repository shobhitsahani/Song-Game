'use client';

import Link from 'next/link';
import { Disc, House } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { GlassSurface } from '@/components/glass/glass-surface';

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center p-4">
      <GlassSurface
        variant="strong"
        radius="xl"
        className="max-w-md w-full p-8 text-center shadow-2xl backdrop-blur-2xl"
      >
        <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/10 border border-[var(--primary)]/25 flex items-center justify-center mx-auto mb-4 text-[var(--primary)]">
          <Disc size={36} weight="duotone" className="animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        <h1 className="text-4xl font-black font-display tracking-tight text-[var(--foreground)] mb-2">
          404
        </h1>
        <p className="text-base text-[var(--muted-foreground)] mb-6">
          The needle skipped off the record. That track or room does not exist.
        </p>
        <Link href="/">
          <Button variant="primary" size="lg" className="w-full font-bold shadow-lg">
            <House size={20} weight="fill" /> Back to Safety
          </Button>
        </Link>
      </GlassSurface>
    </main>
  );
}
