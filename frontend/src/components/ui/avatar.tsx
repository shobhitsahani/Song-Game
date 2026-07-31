'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-14 w-14',
        xl: 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const statusDotVariants = cva(
  'absolute bottom-0 right-0 rounded-full border-2 border-background',
  {
    variants: {
      size: {
        sm: 'h-2.5 w-2.5',
        md: 'h-3 w-3',
        lg: 'h-3.5 w-3.5',
        xl: 'h-4 w-4',
      },
      status: {
        online: 'bg-green-500',
        offline: 'bg-gray-500',
        away: 'bg-yellow-500',
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'offline',
    },
  },
);

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'away';
  premium?: boolean;
  onClick?: () => void;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, src, alt, fallback, status, premium, onClick, ...props }, ref) => {
  const content = (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        avatarVariants({ size }),
        premium && 'ring-2 ring-purple-500 ring-offset-2 ring-offset-background',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      {...props}
    >
      {premium && (
        <motion.div
          className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-75"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ zIndex: -1 }}
        />
      )}
      <AvatarPrimitive.Image
        src={src}
        alt={alt || ''}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-muted-foreground font-medium"
      >
        {fallback || '?'}
      </AvatarPrimitive.Fallback>
      {status && (
        <span className={statusDotVariants({ size, status })} aria-label={status} />
      )}
    </AvatarPrimitive.Root>
  );

  return onClick ? (
    <motion.div whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
      {content}
    </motion.div>
  ) : content;
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-secondary text-muted-foreground',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
