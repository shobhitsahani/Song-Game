'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { JoinRoomModal } from './join-room-modal';
import { RoomSharePopover } from './room-share-popover';

export function FinalCTA() {
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <section className="relative py-20 sm:py-28 border-t border-[var(--border)] bg-[var(--surface-1)]/40">
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-semibold font-display tracking-[-0.02em] text-[var(--foreground)] mb-4 text-balance">
          Ready to test your ear against friends?
        </h2>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] max-w-lg mx-auto mb-8 font-normal leading-relaxed text-pretty">
          Start a room in seconds, share the code, and hear who really knows their music.
        </p>

        {/* Room created StageShow popover */}
        <RoomSharePopover />

        {/* Primary and Secondary system buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link href="/room/create" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="primary"
              className="w-full sm:w-auto min-w-[180px] h-12 text-base font-semibold shadow-md"
            >
              <Play size={18} weight="fill" /> Play
            </Button>
          </Link>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => setShowJoinModal(true)}
            className="w-full sm:w-auto min-w-[180px] h-12 text-base font-semibold"
          >
            Join room <ArrowRight size={16} weight="bold" />
          </Button>
        </div>
      </div>

      <JoinRoomModal open={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </section>
  );
}