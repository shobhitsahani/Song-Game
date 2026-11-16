'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { JoinRoomModal } from './join-room-modal';
import { RoomSharePopover } from './room-share-popover';
import { Container } from '@/components/ui/container';

export function FinalCTA() {
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <section className="relative landing-section border-t border-[var(--border)] bg-[var(--surface-2)] overflow-hidden scroll-mt-[88px]">
      <Container className="text-center">
        <h2 className="landing-h2 mb-4">
          Ready to test your ear against friends?
        </h2>
        <p className="landing-subline mx-auto mb-8">
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
      </Container>

      <JoinRoomModal open={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </section>
  );
}