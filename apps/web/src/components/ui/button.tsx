import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap rounded-[var(--radius-control,10px)] text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.985] cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-105 border border-[var(--primary)] shadow-xs',
        default:
          'bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-105 border border-[var(--primary)] shadow-xs',
        secondary:
          'bg-[var(--surface-1)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-2)] shadow-xs',
        glass:
          'bg-[var(--surface-1)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-2)] shadow-xs',
        outline:
          'bg-transparent text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-2)]',
        ghost:
          'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]',
        destructive:
          'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:brightness-105 shadow-xs',
        link: 'text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto cursor-pointer',
      },
      size: {
        sm: 'min-h-[36px] h-[36px] px-3.5 text-xs rounded-[var(--radius-sm,6px)]',
        default: 'min-h-[44px] h-[44px] px-5 text-sm rounded-[var(--radius-control,10px)]',
        md: 'min-h-[44px] h-[44px] px-5 text-sm rounded-[var(--radius-control,10px)]',
        lg: 'min-h-[48px] h-[48px] px-6 text-base rounded-[var(--radius-control,10px)]',
        icon: 'min-h-[36px] min-w-[36px] h-[36px] w-[36px] p-0 rounded-[var(--radius-control,10px)]',
        'icon-md': 'min-h-[44px] min-w-[44px] h-[44px] w-[44px] p-0 rounded-[var(--radius-control,10px)]',
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
