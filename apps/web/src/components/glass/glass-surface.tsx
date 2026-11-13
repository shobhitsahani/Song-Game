'use client';

import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLiquidSurface } from '@khoivudev/liquid-glass-react';

export type GlassTier = 'refract' | 'frosted' | 'reduced';

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'regular' | 'strong' | 'tint' | 'nav';
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  interactive?: boolean;
  refraction?: boolean;
  specularRim?: boolean;
  children?: React.ReactNode;
}

/**
 * Isolated Refraction Filter component.
 * Only mounted when tier === 'refract' and refraction is explicitly true.
 * This guarantees zero ResizeObserver / MutationObserver / SVG filter overhead for all frosted surfaces.
 */
function RefractFilter({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
}) {
  const options = useMemo(
    () => ({
      targetRef: targetRef as unknown as React.RefObject<HTMLDivElement>,
      glassThickness: 35,
      bezelWidth: 12,
      blur: 0.8,
      refractiveIndex: 1.5,
      specularOpacity: 0.6,
      specularSaturation: 2.5,
    }),
    [targetRef]
  );

  const { Filter, filterStyles } = useLiquidSurface<HTMLDivElement>(options);

  useEffect(() => {
    if (targetRef.current && filterStyles?.backdropFilter) {
      targetRef.current.style.backdropFilter = filterStyles.backdropFilter as string;
      if (filterStyles.WebkitBackdropFilter) {
        (targetRef.current.style as CSSStyleDeclaration & { webkitBackdropFilter: string }).webkitBackdropFilter = filterStyles.WebkitBackdropFilter as string;
      }
    }
  }, [filterStyles, targetRef]);

  return <Filter />;
}

export function GlassSurface({
  variant = 'regular',
  radius = 'lg',
  interactive = false,
  refraction = false,
  specularRim = false,
  className,
  children,
  onPointerMove,
  style,
  ...props
}: GlassSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<GlassTier>('frosted');
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Accessibility check: reduced transparency or contrast
    const prefersReduced =
      window.matchMedia?.('(prefers-reduced-transparency: reduce)').matches ||
      window.matchMedia?.('(prefers-contrast: more)').matches;

    if (prefersReduced) {
      setTier('reduced');
      return;
    }

    if (!refraction) {
      setTier('frosted');
      return;
    }

    // Check Chromium support for SVG displacement map refraction
    const ua = navigator.userAgent;
    const isChromium =
      (!!(window as unknown as { chrome?: unknown }).chrome ||
        ua.includes('Chrome') ||
        ua.includes('Chromium') ||
        ua.includes('Edg')) &&
      !ua.includes('Firefox') &&
      (!ua.includes('Safari') || ua.includes('Chrome'));

    setTier(isChromium ? 'refract' : 'frosted');
  }, [refraction]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Coalesced pointer-driven specular tracker throttled via requestAnimationFrame
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || e.pointerType === 'touch') {
        onPointerMove?.(e);
        return;
      }

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      const clientX = e.clientX;
      const clientY = e.clientY;

      rafRef.current = requestAnimationFrame(() => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const x = clientX - rect.left;
          const y = clientY - rect.top;
          ref.current.style.setProperty('--pointer-x', `${x}px`);
          ref.current.style.setProperty('--pointer-y', `${y}px`);
        }
        rafRef.current = null;
      });

      onPointerMove?.(e);
    },
    [interactive, onPointerMove]
  );

  const radiusClass = {
    sm: 'rounded-xl',
    md: 'rounded-2xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[28px]',
    full: 'rounded-full',
  }[radius];

  const variantClass = {
    regular: 'bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)]',
    strong: 'bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)] backdrop-blur-2xl contrast-105',
    tint: 'bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)] ring-1 ring-[var(--glow)]',
    nav: 'bg-[var(--nav-glass-bg)] border-[var(--nav-glass-border)] shadow-[var(--nav-glass-shadow)] backdrop-blur-[20px] backdrop-saturate-[170%]',
  }[variant];

  return (
    <>
      {refraction && tier === 'refract' && <RefractFilter targetRef={ref} />}
      <div
        ref={ref}
        data-glass={tier}
        onPointerMove={handlePointerMove}
        style={style}
        className={twMerge(
          clsx(
            'liquid-glass-surface liquid-glass-grain',
            radiusClass,
            variantClass,
            specularRim && 'specular-rim',
            interactive && 'transition-transform duration-[80ms] hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer',
            tier === 'reduced' && 'bg-[var(--surface-1)] backdrop-blur-none border-[var(--border)]',
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
}
