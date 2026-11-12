'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[160px] sm:auto-rows-[180px]',
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  cta,
}: {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: React.ComponentType<{ className?: string; size?: number; weight?: string }>;
  description: string;
  cta?: string;
}) => (
  <div
    key={name}
    className={cn(
      'group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-[20px] p-6',
      // Surface token + highlight
      'bg-[var(--surface-1,var(--card))] border border-[var(--border)]',
      'shadow-sm hover:shadow-lg transition-all duration-300',
      'hover:-translate-y-0.5',
      className
    )}
  >
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 transition-all duration-300">
      {Icon && <Icon className="h-7 w-7 origin-left text-[var(--primary)] transition-all duration-300 ease-in-out" weight="duotone" />}
      <h3 className="text-lg font-semibold text-[var(--foreground)] mt-2">
        {name}
      </h3>
      <p className="max-w-lg text-sm text-[var(--muted-foreground)] leading-snug">
        {description}
      </p>
    </div>

    {cta && (
      <div className="pointer-events-none z-10 flex items-center text-xs font-semibold text-[var(--primary)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        {cta}
      </div>
    )}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-[var(--glass-bg)]" />
  </div>
);
