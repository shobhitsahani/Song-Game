'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { soundFx } from '@/lib/sound-fx';

interface TimerRingProps {
  timeLeft: number;
  totalTime: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function TimerRing({
  timeLeft,
  totalTime,
  size = 56,
  strokeWidth = 4,
  className,
}: TimerRingProps) {
  const prevTimeRef = useRef(timeLeft);
  const isLow = timeLeft <= 5 && timeLeft > 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, totalTime > 0 ? timeLeft / totalTime : 0));
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    if (isLow && timeLeft !== prevTimeRef.current) {
      soundFx.playTick();
    }
    prevTimeRef.current = timeLeft;
  }, [timeLeft, isLow]);

  // aria-live announcement at intervals
  const shouldAnnounce = timeLeft === 10 || (timeLeft <= 5 && timeLeft > 0);

  return (
    <div
      className={clsx('relative inline-flex items-center justify-center select-none', className)}
      style={{ width: size, height: size }}
    >
      {shouldAnnounce && (
        <span className="sr-only" role="status" aria-live="assertive">
          {timeLeft} seconds remaining
        </span>
      )}

      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--glass-border)"
          strokeWidth={strokeWidth}
        />
        {/* Indicator */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isLow ? 'var(--destructive)' : 'var(--primary)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{
            strokeDashoffset,
            stroke: isLow ? 'var(--destructive)' : 'var(--primary)',
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={timeLeft}
          animate={isLow ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className={clsx(
            'text-sm font-bold font-mono tabular-nums leading-none',
            isLow ? 'text-[var(--destructive)]' : 'text-[var(--foreground)]'
          )}
        >
          {timeLeft}
        </motion.span>
      </div>
    </div>
  );
}
