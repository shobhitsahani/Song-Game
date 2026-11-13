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

  return (
    <div
      role="radiogroup"
      className={cn(
        'relative inline-flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface-2)]/60 border border-[var(--glass-border)] backdrop-blur-md',
        fullWidth && 'w-full flex',
        className
      )}
    >
      {normalizedOptions.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            whileTap={!shouldReduceMotion ? { scale: 0.96 } : undefined}
            className={cn(
              'relative z-10 rounded-xl font-semibold transition-colors duration-150 outline-none select-none flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer',
              size === 'sm' ? 'px-3 py-1 text-xs min-h-[32px]' : 'px-4 py-2 text-xs sm:text-sm min-h-[38px]',
              fullWidth ? 'flex-1' : 'flex-initial',
              isSelected
                ? 'text-[var(--foreground)] font-bold'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={`segmented-lens-${name}`}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.12 }
                    : liquidSpring
                }
                className="absolute inset-0 rounded-xl bg-white/[0.12] dark:bg-white/[0.08] border border-white/20 dark:border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_16px_-2px_rgba(0,0,0,0.25)] backdrop-blur-lg -z-10"
              />
            )}
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span className="truncate">{opt.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
