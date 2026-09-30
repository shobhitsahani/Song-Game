'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border text-xs font-semibold tracking-tight transition-[color,background-color,border-color,box-shadow] duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gradient-to-r from-gold to-ember text-gold-foreground shadow-md shadow-gold/25',
        secondary: 'border-transparent bg-white/[0.07] text-foreground backdrop-blur-xl',
        outline: 'text-foreground border-white/[0.14] bg-transparent',
        success: 'border-transparent bg-emerald-500/15 text-emerald-400',
        warning: 'border-transparent bg-amber-500/15 text-amber-400',
        danger: 'border-transparent bg-rose-500/15 text-rose-400',
        destructive: 'border-transparent bg-gradient-to-r from-rose-600 to-red-600 text-white',
        premium: 'border-transparent bg-[linear-gradient(110deg,hsl(262_84%_66%_/_0.25),hsl(292_84%_61%_/_0.25))] text-violet-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px] gap-1',
        md: 'px-2.5 py-0.5 text-xs gap-1',
        lg: 'px-3 py-1 text-sm gap-1.5',
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
