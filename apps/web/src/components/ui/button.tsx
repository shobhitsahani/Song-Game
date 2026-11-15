import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap rounded-full text-sm font-semibold transition-[color,background-color,border-color,box-shadow,opacity] duration-[80ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'glass-btn-amber hover:brightness-105 font-bold shadow-xs active:scale-[0.98] transition-[filter,transform,box-shadow] duration-[80ms]',
        default:
          'glass-btn-amber hover:brightness-105 font-bold shadow-xs active:scale-[0.98] transition-[filter,transform,box-shadow] duration-[80ms]',
        glass:
          'liquid-glass-surface bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--foreground)] hover:bg-[var(--card)] hover:border-[var(--glass-highlight)] shadow-xs backdrop-blur-md rounded-full',
        secondary:
          'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:brightness-105 border border-[var(--border)] rounded-full',
        ghost:
          'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-bg)] rounded-full',
        destructive:
          'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:brightness-110 shadow-xs rounded-full',
        outline:
          'border border-[var(--glass-border)] bg-transparent hover:bg-[var(--glass-bg)] text-[var(--foreground)] rounded-full',
        link: 'text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'min-h-[36px] h-[36px] px-3.5 text-xs rounded-full',
        default: 'min-h-[44px] h-[44px] px-5 text-sm rounded-full',
        md: 'min-h-[44px] h-[44px] px-5 text-sm rounded-full',
        lg: 'min-h-[52px] h-[52px] px-7 text-base rounded-full',
        icon: 'min-h-[44px] min-w-[44px] h-[44px] w-[44px] p-0 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
