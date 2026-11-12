'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'regular' | 'strong' | 'tint';
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  interactive?: boolean;
  refraction?: boolean;
  children?: React.ReactNode;
}

export function GlassSurface({
  variant = 'regular',
  radius = 'lg',
  interactive = false,
  refraction = false,
  className,
  children,
  onPointerMove,
  ...props
}: GlassSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [supportsRefraction, setSupportsRefraction] = useState(false);

  useEffect(() => {
    if (!refraction) return;
    // Check if Chromium/supports feDisplacementMap backdrop filter
    const isChromium =
      typeof window !== 'undefined' &&
      !!(window as unknown as { chrome?: unknown }).chrome &&
      navigator.userAgent.indexOf('Chrome') > -1;
    setSupportsRefraction(isChromium);
  }, [refraction]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (interactive && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ref.current.style.setProperty('--pointer-x', `${x}px`);
        ref.current.style.setProperty('--pointer-y', `${y}px`);
      }
      onPointerMove?.(e);
    },
    [interactive, onPointerMove]
  );

  const radiusClass = {
    sm: 'rounded-xl',
    md: 'rounded-2xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  }[radius];

  const variantClass = {
    regular: 'bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)]',
    strong: 'bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)] backdrop-blur-2xl contrast-105',
    tint: 'bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)] ring-1 ring-[var(--glow)]',
  }[variant];

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={twMerge(
        clsx(
          'liquid-glass-surface liquid-glass-grain',
          radiusClass,
          variantClass,
          interactive && 'transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer',
          supportsRefraction && 'refraction-tier2',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
