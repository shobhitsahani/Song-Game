'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Fire } from '@phosphor-icons/react';
import { clsx } from 'clsx';

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  if (streak < 2) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-surface bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold text-xs backdrop-blur-md shadow-sm',
        className
      )}
    >
      <motion.div
        key={streak}
        animate={{ scale: [1, 1.35, 1], rotate: [0, -8, 8, 0] }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Fire size={16} weight="fill" className="text-amber-400" />
      </motion.div>
      <span className="font-mono tabular-nums">{streak}</span>
      <span className="hidden sm:inline">Streak</span>
    </motion.div>
  );
}
