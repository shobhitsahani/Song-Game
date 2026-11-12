'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface ResultRingProps {
  accuracy: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
}

export function ResultRing({
  accuracy,
  size = 120,
  strokeWidth = 10,
  className,
  label = 'Accuracy',
}: ResultRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedAccuracy = Math.max(0, Math.min(100, accuracy));
  const strokeDashoffset = circumference * (1 - clampedAccuracy / 100);

  return (
    <div
      className={cn('relative inline-flex flex-col items-center justify-center select-none', className)}
      style={{ width: size, height: size }}
    >
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
        {/* Animated fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-2xl font-black font-mono tracking-tight text-[var(--foreground)]"
        >
          {clampedAccuracy}%
        </motion.span>
        <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
}
