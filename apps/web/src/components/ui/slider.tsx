'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { liquidSpring } from '@/lib/motion';

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function Slider({
  value,
  min = 5,
  max = 20,
  step = 5,
  onChange,
  className,
  id,
  'aria-label': ariaLabel,
}: SliderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center py-3 group', className)}>
      {/* Track Background */}
      <div className="relative h-2.5 w-full grow overflow-hidden rounded-full bg-[var(--surface-2)] border border-[var(--glass-border)] shadow-inner">
        {/* Filled part with accent glass gradient */}
        <div
          className="h-full bg-gradient-to-r from-[var(--primary)]/80 via-[var(--primary)] to-[var(--accent)]/90 shadow-[0_0_12px_var(--glow)] transition-[width] duration-100 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Accessible native range input */}
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onPointerCancel={() => setIsDragging(false)}
        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-20"
      />

      {/* Glass Lens Thumb (28px) */}
      <motion.div
        animate={{
          scaleX: isDragging ? 1.15 : 1,
          scaleY: isDragging ? 0.92 : 1,
          scale: isDragging ? 1.12 : 1,
        }}
        transition={liquidSpring}
        className="pointer-events-none absolute h-7 w-7 rounded-full border-2 border-white/70 bg-white/20 dark:bg-white/25 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_16px_rgba(0,0,0,0.35)] flex items-center justify-center group-hover:border-white transition-colors"
        style={{
          left: `calc(${percentage}% - 14px)`,
        }}
      >
        {/* Subtle center lens refraction ring */}
        <div className="h-2 w-2 rounded-full bg-[var(--primary)]/80 shadow-[0_0_6px_var(--glow)]" />
      </motion.div>
    </div>
  );
}
