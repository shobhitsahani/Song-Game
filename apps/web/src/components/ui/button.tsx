import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap rounded-full text-sm font-semibold transition-[color,background-color,border-color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-40 active:translate-y-[1px] cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-95 border border-transparent shadow-xs',
        default:
          'bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-95 border border-transparent shadow-xs',
        secondary:
          'bg-[var(--surface-1)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-2)] shadow-xs',
        glass:
          'bg-[var(--surface-1)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-2)] shadow-xs',
        outline:
          'bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-2)]',
        ghost:
          'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]',
        destructive:
          'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:brightness-95 border border-transparent shadow-xs',
        link: 'text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto cursor-pointer rounded-none',
      },
      size: {
        sm: 'min-h-[40px] h-[40px] px-4 text-[14px] rounded-full',
        default: 'min-h-[44px] h-[44px] px-5 text-sm rounded-full',
        md: 'min-h-[44px] h-[44px] px-5 text-sm rounded-full',
        lg: 'min-h-[48px] h-[48px] px-6 text-base rounded-full',
        icon: 'min-h-[40px] min-w-[40px] h-[40px] w-[40px] p-0 rounded-full',
        'icon-sm': 'min-h-[36px] min-w-[36px] h-[36px] w-[36px] p-0 rounded-full',
        'icon-md': 'min-h-[44px] min-w-[44px] h-[44px] w-[44px] p-0 rounded-full',
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
