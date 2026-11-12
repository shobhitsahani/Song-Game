'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const ToggleGroupContext = React.createContext<
  VariantProps<typeof buttonVariants> & { spacing?: 'default' | 'compact' }
>({
  size: 'default',
  variant: 'glass',
  spacing: 'default',
});

export const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof buttonVariants> & { spacing?: 'default' | 'compact' }
>(({ className, variant = 'glass', size = 'default', spacing = 'default', children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      'flex flex-wrap items-center justify-center',
      spacing === 'compact' ? 'gap-1' : 'gap-2',
      className
    )}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof buttonVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        buttonVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        'data-[state=on]:bg-[var(--primary)] data-[state=on]:text-[var(--primary-foreground)] data-[state=on]:border-transparent data-[state=on]:shadow-md transition-all',
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
