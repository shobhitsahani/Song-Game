'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  isFinished: boolean;
}

export const CountdownTimer = memo(function CountdownTimer({ timeLeft, totalTime, isActive, isFinished }: CountdownTimerProps) {
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const isLow = progress < 0.33;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4"
            className="text-white/10" />
          <motion.circle
            cx="32" cy="32" r="28" fill="none" strokeWidth="4"
            strokeLinecap="round"
            className={cn(isLow ? 'text-red-400' : 'text-purple-400')}
            strokeDasharray={2 * Math.PI * 28}
            animate={{
              strokeDashoffset: 2 * Math.PI * 28 * (1 - (isActive ? progress : isFinished ? 0 : 1)),
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={timeLeft}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              'text-lg font-bold tabular-nums',
              isLow ? 'text-red-400' : 'text-foreground'
            )}
          >
            {timeLeft}
          </motion.span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Time</span>
    </div>
  );
});
