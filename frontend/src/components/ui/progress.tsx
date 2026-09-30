'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressVariants = cva(
  'h-full w-full rounded-full transition-colors duration-500',
  {
    variants: {
      color: {
        default: 'bg-[linear-gradient(90deg,hsl(262_84%_66%),hsl(292_84%_61%))] shadow-[0_0_12px_hsla(262_84%_66%/0.5)]',
        success: 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-[0_0_12px_hsla(160_84%_50%/0.4)]',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_12px_hsla(38_92%_50%/0.4)]',
        danger: 'bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_0_12px_hsla(0_84%_55%/0.4)]',
        premium: 'bg-[linear-gradient(90deg,hsl(262_84%_66%),hsl(292_84%_61%)_50%,hsl(217_91%_60%))]',
      },
    },
    defaultVariants: {
      color: 'default',
    },
  },
);

export interface ProgressProps extends VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  barClassName?: string;
}

function Progress({
  value = 0,
  max = 100,
  label,
  showPercentage = false,
  color,
  className,
  barClassName,
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/[0.05]" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <motion.div
          className={cn(progressVariants({ color }), barClassName)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export { Progress, progressVariants };
