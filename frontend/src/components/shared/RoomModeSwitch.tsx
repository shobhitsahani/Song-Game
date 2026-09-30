'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type RoomMode = 'join' | 'create';

const MODES: { id: RoomMode; href: string; label: string; icon: typeof LogIn }[] = [
  { id: 'join', href: '/join-room', label: 'Join a room', icon: LogIn },
  { id: 'create', href: '/create-room', label: 'Create a room', icon: Plus },
];

/**
 * Segmented switcher between the two ways into a game.
 * The active segment carries the spotlight gradient; the pill slides
 * between segments on the same visit via a shared layoutId.
 */
export function RoomModeSwitch({ active }: { active: RoomMode }) {
  return (
    <nav
      aria-label="Room options"
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] p-1 backdrop-blur-xl"
    >
      {MODES.map(({ id, href, label, icon: Icon }) => {
        const isActive = id === active;
        return (
          <Link
            key={id}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isActive ? 'text-gold-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="room-mode-pill"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-gold to-ember shadow-lg shadow-gold/25"
                aria-hidden
              />
            )}
            <Icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}