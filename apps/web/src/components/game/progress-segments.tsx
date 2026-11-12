'use client';

import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

interface ProgressSegmentsProps {
  currentRound: number;
  totalRounds: number;
  className?: string;
}

export function ProgressSegments({
  currentRound,
  totalRounds,
  className,
}: ProgressSegmentsProps) {
  const rounds = Math.max(1, totalRounds);

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] font-medium">
        <span>Round</span>
        <span className="font-mono tabular-nums text-[var(--foreground)] font-semibold">
          {currentRound} of {rounds}
        </span>
      </div>
      <div className="flex items-center gap-1.5 w-full">
        {Array.from({ length: rounds }).map((_, idx) => {
          const roundNum = idx + 1;
          const isCompleted = roundNum < currentRound;
          const isCurrent = roundNum === currentRound;

          return (
            <div
              key={idx}
              className="relative flex-1 h-2 rounded-full overflow-hidden bg-[var(--glass-bg)] border border-[var(--glass-border)]"
            >
              {isCompleted && (
                <div className="h-full w-full bg-[var(--primary)]/70" />
              )}
              {isCurrent && (
                <motion.div
                  layoutId="currentRoundSegment"
                  className="h-full w-full bg-[var(--primary)] shadow-sm shadow-[var(--glow)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
