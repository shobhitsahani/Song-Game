'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

const sizeClasses = { sm: 'h-8 w-8', default: 'h-10 w-10', lg: 'h-12 w-12', xl: 'h-16 w-16' };

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    src?: string | null;
    alt?: string;
    fallback?: string;
    status?: 'online' | 'offline' | 'playing';
    size?: keyof typeof sizeClasses;
  }
>(({ className, src, alt, fallback, status, size = 'default', ...props }, ref) => (
  <div className="relative inline-flex">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(sizeClasses[size], 'relative shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    >
      <AvatarPrimitive.Image
        src={src || undefined}
        alt={alt || ''}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-secondary-foreground border border-[var(--glass-border)] text-sm font-semibold">
        {fallback || '?'}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
    {status && (
      <span
        className={cn(
          'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
          status === 'online' && 'bg-success',
          status === 'offline' && 'bg-muted-foreground/60',
          status === 'playing' && 'bg-primary',
        )}
      />
    )}
  </div>
));
Avatar.displayName = 'Avatar';

export { Avatar };
