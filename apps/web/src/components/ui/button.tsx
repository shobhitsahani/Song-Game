import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap rounded-2xl text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96]',
  {
    variants: {
      variant: {
        primary:
          'glass-btn-amber hover:brightness-105 font-bold shadow-lg shadow-amber-500/25 active:scale-[0.96] transition-transform duration-150',
        default:
          'glass-btn-amber hover:brightness-105 font-bold shadow-lg shadow-amber-500/25 active:scale-[0.96] transition-transform duration-150',
        glass:
          'liquid-glass-surface bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--foreground)] hover:bg-[var(--card)] hover:border-[var(--glass-highlight)] shadow-sm backdrop-blur-md',
        secondary:
          'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:brightness-105 border border-[var(--border)]',
        ghost:
          'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--glass-bg)]',
        destructive:
          'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:brightness-110 shadow-md',
        outline:
          'border border-[var(--glass-border)] bg-transparent hover:bg-[var(--glass-bg)] text-[var(--foreground)]',
        link: 'text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'min-h-[44px] h-[44px] px-4 text-sm rounded-xl',
        default: 'min-h-[48px] h-[48px] px-6 text-base rounded-2xl',
        lg: 'min-h-[56px] h-[56px] px-8 text-lg rounded-2xl',
        icon: 'min-h-[44px] min-w-[44px] h-[44px] w-[44px] p-0 rounded-2xl',
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
