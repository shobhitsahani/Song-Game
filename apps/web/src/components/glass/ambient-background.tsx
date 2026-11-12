'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface AmbientBackgroundProps {
  state?: 'idle' | 'correct' | 'wrong';
  className?: string;
}

export function AmbientBackground({ state = 'idle', className }: AmbientBackgroundProps) {
  const [isTabHidden, setIsTabHidden] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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

      {/* Living Ambient Orbs */}
      <div
        className={clsx(
          'absolute inset-0 overflow-hidden',
          isTabHidden && 'motion-reduce:animate-none'
        )}
      >
        {/* Orb 1: Primary Accent (Amber/Pink/Cobalt) */}
        <div
          className={clsx(
            'absolute -top-[10%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full blur-[100px] opacity-70 transition-transform duration-1000',
            !isTabHidden && 'animate-drift-slow'
          )}
          style={{
            background: 'radial-gradient(circle, var(--orb-1) 0%, transparent 70%)',
          }}
        />

        {/* Orb 2: Secondary Accent (Cyan/Peach/Tangerine) */}
        <div
          className={clsx(
            'absolute top-[35%] -right-[15%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full blur-[120px] opacity-60 transition-transform duration-1000',
            !isTabHidden && 'animate-drift-reverse'
          )}
          style={{
            background: 'radial-gradient(circle, var(--orb-2) 0%, transparent 70%)',
          }}
        />

        {/* Orb 3: Deep harmonic glow (Violet/Magenta/Lilac) */}
        <div
          className={clsx(
            'absolute -bottom-[15%] left-[20%] w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full blur-[140px] opacity-50 transition-transform duration-1000',
            !isTabHidden && 'animate-drift-slow'
          )}
          style={{
            background: 'radial-gradient(circle, var(--orb-3) 0%, transparent 70%)',
          }}
        />
      </div>

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
