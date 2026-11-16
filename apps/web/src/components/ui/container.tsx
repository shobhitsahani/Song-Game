import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'w-full max-w-[1200px] mx-auto px-[clamp(20px,4vw,40px)]',
          className
        )}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';
