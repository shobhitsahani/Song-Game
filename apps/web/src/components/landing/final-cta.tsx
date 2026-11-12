'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { JoinRoomModal } from './join-room-modal';

export function FinalCTA() {
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <section className="relative py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* One quiet glass panel over the subtle background */}
      <div className="relative rounded-[24px] sm:rounded-[28px] p-8 sm:p-14 text-center liquid-glass-surface bg-[var(--surface-1)]/80 border border-[var(--glass-border)] shadow-2xl backdrop-blur-2xl max-w-3xl mx-auto overflow-hidden">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-3">
          Ready to test your ear against friends?
        </h2>
        <p className="text-base text-[var(--muted-foreground)] max-w-md mx-auto mb-8">
          Start a room in seconds, share the code, and hear who really knows their music.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link href="/room/create" className="w-full sm:w-auto">
            <Button size="lg" variant="primary" className="w-full sm:w-auto min-w-[180px] h-12 text-base font-bold shadow-xl rounded-xl">
              <Play size={18} weight="fill" /> Play
            </Button>
          </Link>

          <Button
            size="lg"
            variant="glass"
            onClick={() => setShowJoinModal(true)}
            className="w-full sm:w-auto min-w-[180px] h-12 text-base font-semibold rounded-xl"
          >
            Join room <ArrowRight size={18} weight="bold" />
          </Button>
        </div>
      </div>

      <JoinRoomModal open={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </section>
  );
}
