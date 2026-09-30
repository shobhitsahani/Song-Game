'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-[color,background-color,border-color,box-shadow,transform] duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-gold to-ember text-gold-foreground hover:from-gold/90 hover:to-ember/90 shadow-lg shadow-gold/25',
        primary: 'bg-gradient-to-r from-gold to-ember text-gold-foreground hover:from-gold/90 hover:to-ember/90 shadow-lg shadow-gold/25',
        secondary: 'bg-white/[0.06] text-foreground hover:bg-white/[0.1] backdrop-blur-xl border border-white/[0.08]',
        ghost: 'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground',
        destructive: 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:brightness-110 shadow-lg shadow-rose-600/25',
        outline: 'border border-white/[0.12] bg-transparent text-foreground hover:bg-white/[0.06] hover:border-white/[0.22]',
        glass: 'glass glass-hover text-foreground',
        link: 'text-gold underline-offset-4 hover:underline',
        gradient: 'bg-[linear-gradient(110deg,hsl(262_84%_66%),hsl(292_84%_61%)_45%,hsl(217_91%_60%))] bg-[length:200%_100%] text-white hover:bg-right bg-left shadow-lg shadow-violet-600/25 transition-[background-position] duration-500',
      },
      size: {
        sm: 'h-9 rounded-lg px-3 text-xs gap-1.5',
        md: 'h-10 rounded-xl px-4 py-2 gap-2',
        lg: 'h-11 rounded-xl px-8 gap-2',
        xl: 'h-14 rounded-2xl px-10 text-base gap-3',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, loading, icon, disabled, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          {...props}
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon}
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        whileTap={disabled || loading ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : icon}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
