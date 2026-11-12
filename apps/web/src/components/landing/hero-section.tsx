'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Users, Disc, Trophy, ArrowClockwise } from '@phosphor-icons/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { JoinRoomModal } from './join-room-modal';
import { VinylHero } from '@/components/three/vinyl-hero';

export function HeroSection() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);

  useEffect(() => {
    // Check if there is a game in progress to resume
    try {
      const savedCode = localStorage.getItem('last_room_code');
      if (savedCode) {
        setActiveRoomCode(savedCode);
      }
    } catch {}
  }, []);

  return (
    <section className="relative min-h-[90dvh] flex flex-col items-center justify-center pt-24 pb-16 px-4">
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Procedural 3D Vinyl Hero */}
        <div className="relative mb-6">
          <VinylHero size={260} />
          {/* Subtle glow underneath vinyl */}
          <div className="absolute inset-0 bg-[var(--glow)] rounded-full blur-3xl -z-10 opacity-30 pointer-events-none" />
        </div>

        {/* Concrete Music-Specific Headline (No eyebrow chip!) */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-[var(--foreground)] max-w-3xl leading-[1.08] mb-5"
        >
          Name that track before the needle drops.
        </motion.h1>

        {/* Warm, plain copy */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-base sm:text-xl text-[var(--muted-foreground)] max-w-xl mx-auto mb-8 font-normal leading-relaxed"
        >
          Real-time multiplayer music trivia. 15-second song clips, instant tactile answers, and room leaderboards with friends.
        </motion.p>

        {/* Primary and Secondary Action Buttons in Thumb Zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md"
        >
          {activeRoomCode ? (
            <Link href={`/room/${activeRoomCode}`} className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full min-w-[200px] h-14 text-base font-bold shadow-xl">
                <ArrowClockwise size={20} weight="bold" /> Resume Round ({activeRoomCode})
              </Button>
            </Link>
          ) : (
            <Link href="/room/create" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full min-w-[200px] h-14 text-base font-bold shadow-xl">
                <Play size={20} weight="fill" /> Start a round
              </Button>
            </Link>
          )}

          <Button
            size="lg"
            variant="glass"
            className="w-full sm:w-auto min-w-[170px] h-14 text-base"
            onClick={() => setShowJoinModal(true)}
          >
            <Users size={20} /> Join room
          </Button>
        </motion.div>

        <JoinRoomModal open={showJoinModal} onClose={() => setShowJoinModal(false)} />

        {/* Focused Social Proof Pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-14 flex items-center justify-center gap-4 sm:gap-8 flex-wrap"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--muted-foreground)]">
            <Disc size={18} className="text-[var(--primary)]" weight="duotone" />
            <span className="font-mono font-semibold text-[var(--foreground)]">10,000+</span> licensed clips
          </div>
          <div className="h-4 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--muted-foreground)]">
            <Users size={18} className="text-[var(--accent)]" weight="duotone" />
            <span className="font-mono font-semibold text-[var(--foreground)]">Real-time</span> rooms
          </div>
          <div className="h-4 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--muted-foreground)]">
            <Trophy size={18} className="text-amber-400" weight="duotone" />
            <span className="font-mono font-semibold text-[var(--foreground)]">Speed bonus</span> scoring
          </div>
        </motion.div>
      </div>
    </section>
  );
}
