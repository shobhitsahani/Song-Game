'use client';

import React from 'react';
import { clsx } from 'clsx';

interface AmbientBackgroundProps {
  state?: 'idle' | 'correct' | 'wrong';
  className?: string;
}

export function AmbientBackground({ state = 'idle', className }: AmbientBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'pointer-events-none fixed inset-0 z-[-1] overflow-hidden select-none transition-filter duration-700',
        state === 'correct' && 'brightness-110 saturate-125',
        state === 'wrong' && 'saturate-50 contrast-95',
        className
      )}
    >
      {/* Background solid base */}
      <div className="absolute inset-0 bg-[var(--background)] transition-colors duration-500" />

      {/* Fine ambient noise grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
