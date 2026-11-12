'use client';

import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface AudioWaveformProps {
  isPlaying?: boolean;
  barCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AudioWaveform({
  isPlaying = false,
  barCount = 12,
  className,
  size = 'md',
}: AudioWaveformProps) {
  const heightMap = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-16',
  }[size];

  const heights = [0.3, 0.7, 1, 0.5, 0.9, 0.4, 0.8, 0.6, 0.95, 0.35, 0.75, 0.5];

  return (
    <div
      role="img"
      aria-label={isPlaying ? 'Music playing waveform' : 'Music paused waveform'}
      className={clsx('flex items-center gap-1 justify-center', heightMap, className)}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const peak = heights[i % heights.length];
        return (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-[var(--primary)] origin-bottom transition-colors duration-300"
            animate={
              isPlaying
                ? {
                    scaleY: [0.2, peak, 0.15, peak * 0.8, 0.2],
                    opacity: [0.6, 1, 0.5, 0.9, 0.6],
                  }
                : {
                    scaleY: 0.2,
                    opacity: 0.3,
                  }
            }
            transition={{
              duration: 0.8 + (i % 5) * 0.15,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (i * 0.08) % 0.5,
            }}
            style={{ height: '100%' }}
          />
        );
      })}
    </div>
  );
}
