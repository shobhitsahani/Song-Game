'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

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
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center py-2', className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-[var(--secondary)] border border-[var(--glass-border)]">
        <div
          className="h-full bg-[var(--primary)] transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
      />
      <div
        className="pointer-events-none absolute h-6 w-6 rounded-full border-2 border-[var(--primary)] bg-[var(--foreground)] shadow-lg transition-transform"
        style={{
          left: `calc(${percentage}% - 12px)`,
        }}
      />
    </div>
  );
}
