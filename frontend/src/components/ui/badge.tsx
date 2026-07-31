'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground border-border',
        success: 'border-transparent bg-green-500/20 text-green-400',
        warning: 'border-transparent bg-yellow-500/20 text-yellow-400',
        danger: 'border-transparent bg-red-500/20 text-red-400',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        premium: 'border-transparent bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

function Badge({ className, variant, size, pulse, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        pulse && variant !== 'outline' && 'animate-pulse',
        className,
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
