'use client';

import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLiquidSurface } from '@khoivudev/liquid-glass-react';
export type GlassTier = 'refract' | 'frosted' | 'reduced';

// Memoize generated displacement map and specular layer textures to avoid regenerating identical canvas textures
const liquidMapCache = new Map<string, string>();

if (typeof window !== 'undefined' && !(window as unknown as { __liquidMapMemoized?: boolean }).__liquidMapMemoized) {
  (window as unknown as { __liquidMapMemoized?: boolean }).__liquidMapMemoized = true;

  const originalPutImageData = CanvasRenderingContext2D.prototype.putImageData;
  CanvasRenderingContext2D.prototype.putImageData = function (
    this: CanvasRenderingContext2D,
    imageData: ImageData,
    dx: number,
    dy: number,
    ...rest: [dirtyX?: number, dirtyY?: number, dirtyWidth?: number, dirtyHeight?: number]
  ) {
    if (imageData && imageData.width > 0 && imageData.height > 0 && imageData.width <= 2560 && imageData.height <= 2560) {
      // Differentiate displacement map vs specular layer
      // Displacement map buffer is prefilled with 0xFF008080 (R=128, G=128, B=0, A=255)
      // Specular layer buffer is prefilled with 0x00000000 (R=0, G=0, B=0, A=0)
      const data = imageData.data;
      const isDisplacement = data[0] === 128 && data[3] === 255;
      const type = isDisplacement ? 'disp' : 'spec';

      // Sample distinct points across the buffer to capture radius and bezel variations
      const len = data.length;
      const p1 = data[0];
      const p2 = data[Math.floor(len * 0.125)] || 0;
      const p3 = data[Math.floor(len * 0.25)] || 0;
      const p4 = data[Math.floor(len * 0.5)] || 0;
      const p5 = data[Math.floor(len * 0.75)] || 0;
      const p6 = data[len - 4] || 0;
      const sample = `${p1}_${p2}_${p3}_${p4}_${p5}_${p6}`;

      (this.canvas as HTMLCanvasElement & { __liquidKey?: string }).__liquidKey = `${type}_${imageData.width}x${imageData.height}_${sample}`;
    }
    return Reflect.apply(originalPutImageData, this, [imageData, dx, dy, ...rest]);
  };

  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function (this: HTMLCanvasElement & { __liquidKey?: string }, ...args: [type?: string, quality?: number]) {
    if (this.__liquidKey) {
      const cached = liquidMapCache.get(this.__liquidKey);
      if (cached) return cached;
      const res = originalToDataURL.apply(this, args);
      liquidMapCache.set(this.__liquidKey, res);
      if (process.env.NODE_ENV !== 'production') {
        console.log('[LiquidGlass] Memoized map generation:', this.__liquidKey);
      }
      return res;
    }
    return originalToDataURL.apply(this, args);
  };
}

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
 * Explicitly manages width, height, and borderRadius to disable liquid-glass-react's
 * internal uncoalesced ResizeObserver and MutationObserver, driving updates via rAF.
 */
function RefractFilter({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [dims, setDims] = useState<{ width: number; height: number; radius: number }>({
    width: 1200,
    height: 56,
    radius: 28,
  });

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    let rafId: number | null = null;
    const updateDimensions = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width) || 1200;
      const h = Math.round(rect.height) || 56;
      setDims((prev) => {
        if (Math.abs(prev.width - w) < 2 && Math.abs(prev.height - h) < 2) {
          return prev;
        }
        return { width: w, height: h, radius: Math.round(h / 2) };
      });
    };

    updateDimensions();

    const ro = new ResizeObserver(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateDimensions();
        rafId = null;
      });
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [targetRef]);

  const options = useMemo(
    () => ({
      targetRef: targetRef as unknown as React.RefObject<HTMLDivElement>,
      width: dims.width,
      height: dims.height,
      borderRadius: dims.radius,
      glassThickness: 35,
      bezelWidth: 12,
      blur: 0.8,
      refractiveIndex: 1.5,
      specularOpacity: 0.6,
      specularSaturation: 2.5,
    }),
    [targetRef, dims.width, dims.height, dims.radius]
  );

  const { Filter, filterStyles } = useLiquidSurface<HTMLDivElement>(
    options as unknown as Parameters<typeof useLiquidSurface<HTMLDivElement>>[0]
  );

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
            interactive && 'transition-[transform,opacity] duration-[80ms] hover:-translate-y-0.5 active:opacity-90 cursor-pointer',
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
