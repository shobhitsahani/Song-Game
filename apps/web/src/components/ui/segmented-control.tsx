'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { liquidSpring } from '@/lib/motion';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  name: string; // unique layoutId
  options: (SegmentedControlOption<T> | T)[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'default';
  className?: string;
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string = string>({
  name,
  options,
  value,
  onChange,
  size = 'default',
  className,
  fullWidth = false,
}: SegmentedControlProps<T>) {
  const shouldReduceMotion = useReducedMotion();

  const normalizedOptions: SegmentedControlOption<T>[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt as T, label: opt };
      }
      return opt;
    });
  }, [options]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = normalizedOptions.findIndex((o) => o.value === value);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % normalizedOptions.length;
      onChange(normalizedOptions[nextIndex].value);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + normalizedOptions.length) % normalizedOptions.length;
      onChange(normalizedOptions[prevIndex].value);
    }
  };

  return (
    <div
      role="radiogroup"
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-flex items-center gap-1 p-1 rounded-[var(--radius-control,10px)] bg-[var(--surface-2)] border border-[var(--border)] shadow-xs',
        fullWidth && 'w-full flex',
        className
      )}
    >
      {normalizedOptions.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative z-10 rounded-[var(--radius-sm,6px)] font-semibold transition-[color,background-color,opacity] duration-[100ms] outline-none select-none flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer active:scale-[0.98]',
              size === 'sm' ? 'px-3 py-1 text-xs min-h-[32px]' : 'px-3.5 py-1.5 text-xs sm:text-sm min-h-[36px]',
              fullWidth ? 'flex-1' : 'flex-initial',
              isSelected
                ? 'text-[var(--foreground)] font-bold'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]/50'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={`segmented-lens-${name}`}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.08 }
                    : liquidSpring
                }
                className="absolute inset-0 rounded-[var(--radius-sm,6px)] bg-[var(--surface-1)] border border-[var(--border)] shadow-xs -z-10"
              />
            )}
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
