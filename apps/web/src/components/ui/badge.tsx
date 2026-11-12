import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--foreground)] backdrop-blur-sm',
        secondary:
          'border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)]',
        primary:
          'border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]',
        destructive:
          'border-[var(--destructive)]/30 bg-[var(--destructive)]/15 text-[var(--destructive)]',
        success:
          'border-[var(--success)]/30 bg-[var(--success)]/15 text-[var(--success)]',
        warning:
          'border-amber-500/30 bg-amber-500/15 text-amber-300',
        premium:
          'border-[var(--glass-highlight)] bg-[var(--glass-bg)] text-[var(--primary)] shadow-sm backdrop-blur-md',
        outline:
          'border-[var(--border)] text-[var(--foreground)]',
      },
      size: {
        default: 'px-3 py-1 text-xs',
        sm: 'px-2 py-0.5 text-[11px]',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
