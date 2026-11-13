'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function Logo({ className, size = 'md', animated = true }: LogoProps) {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-base', svg: 28 },
    md: { box: 'w-9 h-9', text: 'text-xl', svg: 36 },
    lg: { box: 'w-12 h-12', text: 'text-2xl', svg: 48 },
  }[size];

  return (
    <Link
      href="/"
      aria-label="Song Game homepage"
      className={clsx(
        'group inline-flex items-center gap-3 select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-xl transition-opacity hover:opacity-90',
        className
      )}
    >
      {/* Crisp Vinyl + Waveform Logo Mark */}
      <div
        className={clsx(
          sizeMap.box,
          'relative shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300'
        )}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[var(--primary)]"
        >
          {/* Vinyl outer groove */}
          <motion.circle
            cx="20"
            cy="20"
            r="17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.3"
            initial={animated ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {/* Vinyl inner groove */}
          <motion.circle
            cx="20"
            cy="20"
            r="12"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeOpacity="0.5"
            initial={animated ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
          />
          {/* Waveform center bar 1 */}
          <motion.line
            x1="16"
            y1="16"
            x2="16"
            y2="24"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={animated ? { scaleY: 0 } : false}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          />
          {/* Waveform center bar 2 (center tall) */}
          <motion.line
            x1="20"
            y1="13"
            x2="20"
            y2="27"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={animated ? { scaleY: 0 } : false}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          />
          {/* Waveform center bar 3 */}
          <motion.line
            x1="24"
            y1="17"
            x2="24"
            y2="23"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={animated ? { scaleY: 0 } : false}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          />
        </svg>
      </div>

      <span
        className={clsx(
          sizeMap.text,
          'font-display font-bold tracking-tight text-[var(--foreground)]'
        )}
      >
        Song<span className="text-[var(--primary)]">Game</span>
      </span>
    </Link>
  );
}
