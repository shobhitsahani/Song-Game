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
        default: 'bg-gradient-to-r from-purple-600 to-pink-600',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        danger: 'bg-gradient-to-r from-red-500 to-rose-500',
        premium: 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500',
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
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
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
