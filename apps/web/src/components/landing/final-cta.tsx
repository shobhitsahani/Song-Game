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
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (7 of 12): Headline, one sentence, and buttons directly under */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <h2 className="landing-h2 mb-4">
              Ready to test your ear against friends?
            </h2>
            <p className="landing-subline mb-8">
              Start a room in seconds, share the code, and hear who really knows their music.
            </p>

            {/* Primary and Secondary system buttons directly under sentence */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link href="/room/create" className="w-full sm:w-auto">
                <Button
                  size="md"
                  variant="primary"
                  className="w-full sm:w-auto min-w-[160px] h-11 px-6 text-base font-semibold shadow-xs"
                >
                  <Play size={18} weight="fill" /> Play
                </Button>
              </Link>

              <Button
                size="md"
                variant="secondary"
                onClick={() => setShowJoinModal(true)}
                className="w-full sm:w-auto min-w-[160px] h-11 px-6 text-base font-semibold"
              >
                Join room <ArrowRight size={16} weight="bold" />
              </Button>
            </div>
          </div>

          {/* Right Column (5 of 12): Lobby window that bleeds off right */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full overflow-hidden xl:overflow-visible">
            <RoomSharePopover />
          </div>
        </div>
      </Container>

      <JoinRoomModal open={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </section>
  );
}
