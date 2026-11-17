'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Play, ArrowRight, List, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from '@/components/ui/input-otp';
import { ThemeMenu } from './theme-menu';
import { MobileNavPanel } from './mobile-nav';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';
import { generateDisplacementMap, isRefractionSupported } from './liquid-glass-filter';
import './liquid-glass.css';

export function NavLogoMark({ className }: { className?: string }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 text-[var(--primary)]', className)}
      aria-hidden="true"
    >
      {/* Outer vinyl rim */}
      <circle cx="14" cy="14" r="12.5" stroke="currentColor" strokeWidth="1.75" />
      {/* Subtle audio groove */}
      <circle cx="14" cy="14" r="8.5" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
      {/* Dynamic 3-bar equalizer at vinyl center */}
      <line x1="11" y1="12" x2="11" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="9" x2="14" y2="19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="17" y1="11" x2="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface NavLinkItem {
  href: string;
  label: string;
  anchorId?: string;
}

const CENTER_LINKS: NavLinkItem[] = [
  { href: '/#how', label: 'How it works', anchorId: 'how' },
  { href: '/#modes', label: 'Modes', anchorId: 'modes' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export const Navbar = React.memo(function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const rawId = React.useId();
  const filterId = `glass-refract-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const glassRef = useRef<HTMLDivElement>(null);
  const [glassMode, setGlassMode] = useState<'frosted' | 'refract'>('frosted');
  const [displacementUrl, setDisplacementUrl] = useState<string>('');
  const [glassSize, setGlassSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [isLensAnimated, setIsLensAnimated] = useState(false);
  const [lensState, setLensState] = useState<{
    x: number;
    width: number;
    visible: boolean;
    scaleX: number;
    scaleY: number;
  }>({
    x: 0,
    width: 0,
    visible: false,
    scaleX: 1,
    scaleY: 1,
  });

  const lensTrackRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const leaveTimerRef = useRef<number | null>(null);
  const stretchTimerRef = useRef<number | null>(null);
  const hasMountedRef = useRef(false);

  const [joinPopoverOpen, setJoinPopoverOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  // Determine active href based on route and intersection anchor
  const getActiveHref = useCallback(() => {
    if (pathname === '/leaderboard') return '/leaderboard';
    if (pathname === '/') {
      if (activeAnchor === 'how') return '/#how';
      if (activeAnchor === 'modes') return '/#modes';
    }
    return null;
  }, [pathname, activeAnchor]);

  const activeHref = getActiveHref();
  const targetHref = hoveredHref ?? activeHref;

  const updateLensPosition = useCallback(
    (target: string | null, shouldAnimate: boolean) => {
      if (!lensTrackRef.current) return;

      if (!target) {
        setLensState((prev) => ({
          ...prev,
          visible: false,
          scaleX: 1,
          scaleY: 1,
        }));
        return;
      }

      const targetEl = linkRefs.current.get(target);
      if (!targetEl) {
        setLensState((prev) => ({
          ...prev,
          visible: false,
          scaleX: 1,
          scaleY: 1,
        }));
        return;
      }

      const trackRect = lensTrackRef.current.getBoundingClientRect();
      const linkRect = targetEl.getBoundingClientRect();
      const nextX = Math.round(linkRect.left - trackRect.left);
      const nextWidth = Math.round(linkRect.width);

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!shouldAnimate || prefersReducedMotion) {
        setLensState({
          x: nextX,
          width: nextWidth,
          visible: true,
          scaleX: 1,
          scaleY: 1,
        });
        return;
      }

      // Mid-move liquid stretch: 1.04 scaleX, 0.97 scaleY
      setLensState((prev) => {
        const isMoving = Math.abs(prev.x - nextX) > 2;
        return {
          x: nextX,
          width: nextWidth,
          visible: true,
          scaleX: isMoving ? 1.04 : 1,
          scaleY: isMoving ? 0.97 : 1,
        };
      });

      if (stretchTimerRef.current) {
        window.clearTimeout(stretchTimerRef.current);
      }
      stretchTimerRef.current = window.setTimeout(() => {
        setLensState((prev) => ({
          ...prev,
          scaleX: 1,
          scaleY: 1,
        }));
      }, 200);
    },
    []
  );

  // Position lens on mount (instant snap) and when targetHref changes
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      updateLensPosition(targetHref, false);
      const t = window.setTimeout(() => {
        setIsLensAnimated(true);
      }, 50);
      return () => window.clearTimeout(t);
    } else {
      updateLensPosition(targetHref, true);
    }
  }, [targetHref, updateLensPosition, glassSize]);

  const handleLinkEnter = useCallback((href: string) => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHoveredHref(href);
  }, []);

  const handleTrackLeave = useCallback(() => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = window.setTimeout(() => {
      setHoveredHref(null);
    }, 160);
  }, []);

  // ResizeObserver on .glass to track CSS size and regenerate displacement map (debounced 150ms)
  useEffect(() => {
    if (!glassRef.current) return;
    const updateSize = () => {
      if (!glassRef.current) return;
      const rect = glassRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setGlassSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };
    updateSize();
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => updateSize());
    }

    let timeoutId: number;
    const ro = new ResizeObserver((entries) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            updateSize();
          }
        }
      }, 150);
    });
    ro.observe(glassRef.current);
    return () => {
      window.clearTimeout(timeoutId);
      ro.disconnect();
    };
  }, []);

  // Generate SVG refraction displacement map if Chromium is detected
  useEffect(() => {
    const evaluateRefraction = () => {
      if (glassSize.width > 0 && glassSize.height > 0 && isRefractionSupported()) {
        const url = generateDisplacementMap({
          width: glassSize.width,
          height: glassSize.height,
          bezel: 25,
        });
        if (url) {
          setDisplacementUrl(url);
          setGlassMode('refract');
          return;
        }
      }
      setGlassMode('frosted');
    };

    evaluateRefraction();

    const handleResize = () => {
      evaluateRefraction();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [glassSize]);

  // 1. Scroll reactivity & pointer-lit rim (passive, rAF-lerped, zero React re-renders)
  useEffect(() => {
    let scrollP = 0;
    let pointerAngle = 0;
    let currentX = 50;
    let currentY = 50;
    let currentOpacity = 0;
    let targetOpacity = 0;
    let targetX = 50;
    let targetY = 50;
    let targetPointerAngle = 0;
    let rafId: number | null = null;
    let isFinePointer = false;

    if (typeof window !== 'undefined') {
      const isCoarse = window.matchMedia('(pointer: coarse)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      isFinePointer = !isCoarse && !prefersReducedMotion;
    }

    const updateProperties = () => {
      if (!glassRef.current) return;
      const angle = 135 + scrollP * 25 + pointerAngle;
      glassRef.current.style.setProperty('--glass-p', scrollP.toFixed(3));
      glassRef.current.style.setProperty('--light-angle', `${angle.toFixed(1)}deg`);
      glassRef.current.style.setProperty('--mx', `${currentX.toFixed(1)}px`);
      glassRef.current.style.setProperty('--my', `${currentY.toFixed(1)}px`);
      glassRef.current.style.setProperty('--sheen-opacity', currentOpacity.toFixed(3));
      glassRef.current.dataset.scrolled = scrollP > 0.05 ? 'true' : 'false';
    };

    const handleScroll = () => {
      const scrollY = window.scrollY || 0;
      const p = Math.min(1, Math.max(0, scrollY / 140));
      scrollP = p;
      if (!rafId) {
        updateProperties();
      }
    };

    // Lerp loop for pointer sheen & rim light
    const loop = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      currentOpacity += (targetOpacity - currentOpacity) * 0.18;
      pointerAngle += (targetPointerAngle - pointerAngle) * 0.18;

      updateProperties();

      const settled =
        targetOpacity === 0 &&
        currentOpacity < 0.005 &&
        Math.abs(pointerAngle) < 0.05;

      if (!settled) {
        rafId = window.requestAnimationFrame(loop);
      } else {
        currentOpacity = 0;
        pointerAngle = 0;
        updateProperties();
        rafId = null;
      }
    };

    const startLoop = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(loop);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isFinePointer || !glassRef.current) return;
      const rect = glassRef.current.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      targetOpacity = 1;
      const ratio = (targetX / rect.width - 0.5) * 2; // -1 to +1
      targetPointerAngle = Math.max(-10, Math.min(10, ratio * 10));
      startLoop();
    };

    const handlePointerLeave = () => {
      if (!isFinePointer) return;
      targetOpacity = 0;
      targetPointerAngle = 0;
      startLoop();
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    const el = glassRef.current;
    if (el && isFinePointer) {
      el.addEventListener('pointermove', handlePointerMove, { passive: true });
      el.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (el && isFinePointer) {
        el.removeEventListener('pointermove', handlePointerMove);
        el.removeEventListener('pointerleave', handlePointerLeave);
      }
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // 2. IntersectionObserver for anchor links (#how and #modes) - no scroll listeners
  useEffect(() => {
    if (pathname !== '/') {
      setActiveAnchor(null);
      return;
    }

    const sections = ['how', 'modes']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveAnchor(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0, 0.25],
      }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [pathname]);

  // 2.5 Hash state sync on initial client mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'how' || hash === 'modes') {
        setActiveAnchor(hash);
      }
    }
  }, []);

  const handleJoinSubmit = () => {
    const trimmed = joinCode.trim().toUpperCase();
    if (trimmed.length >= 4) {
      setJoinPopoverOpen(false);
      setJoinCode('');
      router.push(`/room/${trimmed}`);
    }
  };

  const handleCloseMobile = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-3 sm:top-4 z-40 w-full pointer-events-none nav-entrance">
      {/* Hidden SVG Refraction Filter for Chromium */}
      {glassMode === 'refract' && displacementUrl && glassSize.width > 0 && glassSize.height > 0 && (
        <svg
          width="0"
          height="0"
          style={{ position: 'absolute', pointerEvents: 'none', width: 0, height: 0 }}
          aria-hidden="true"
          focusable="false"
        >
          <filter
            id={filterId}
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={glassSize.width}
            height={glassSize.height}
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={displacementUrl}
              xlinkHref={displacementUrl}
              x="0"
              y="0"
              width={glassSize.width}
              height={glassSize.height}
              result="map"
              preserveAspectRatio="none"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale="78"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="0.75" result="smoothed" />
            <feColorMatrix in="smoothed" type="saturate" values="1.6" />
          </filter>
        </svg>
      )}

      <Container className="pointer-events-auto">
        <div
          ref={glassRef}
          className="glass group"
          data-glass={glassMode}
          style={{
            ['--glass-filter-ref' as string]:
              glassMode === 'refract' && displacementUrl ? `url(#${filterId})` : undefined,
          }}
        >
          {/* Layer 1: Backdrop with frosted blur + saturate */}
          <div className="glass__backdrop" aria-hidden="true" />

          {/* Layer 1.5: Edge band - peripheral lensing ring for all browsers */}
          <div className="glass__edge-band" aria-hidden="true" />

          {/* Layer 2: Tint & inner highlights */}
          <div className="glass__tint" aria-hidden="true" />

          {/* Layer 3: Dynamic 1.25px bright rim */}
          <div className="glass__rim" aria-hidden="true" />

          {/* Layer 4: Pointer-lit sheen */}
          <div className="glass__sheen" aria-hidden="true" />

          {/* Layer 5: Nav Content Grid */}
          <nav
            aria-label="Primary"
            className="glass__content"
          >
            {/* Left: Brand - 24-28px custom mark + 1-color display wordmark */}
            <div className="justify-self-start flex items-center pl-2">
          <Link
            href="/"
            aria-label="SongGame home"
            className="group inline-flex items-center gap-2.5 select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-full"
          >
            <NavLogoMark />
            <span className="font-display font-semibold text-[17px] tracking-[-0.01em] text-[var(--foreground)] glass-text-halo">
              SongGame
            </span>
          </Link>
        </div>

        {/* Center: Links (Desktop) - 15px, medium weight, with sliding glass lens */}
        <div
          ref={lensTrackRef}
          onMouseLeave={handleTrackLeave}
          onBlur={(e) => {
            if (!lensTrackRef.current?.contains(e.relatedTarget as Node)) {
              handleTrackLeave();
            }
          }}
          className="justify-self-center hidden min-[900px]:flex items-center gap-1 glass-lens-track"
        >
          {/* Sliding Glass Lens */}
          <span
            className="glass-lens"
            data-animate={isLensAnimated ? 'true' : 'false'}
            style={{
              transform: `translateX(${lensState.x}px) scaleX(${lensState.scaleX}) scaleY(${lensState.scaleY})`,
              width: `${lensState.width}px`,
              opacity: lensState.visible ? 1 : 0,
            }}
            aria-hidden="true"
          />

          {CENTER_LINKS.map((link) => {
            const isRouteActive = pathname === link.href;
            const isAnchorActive = pathname === '/' && link.anchorId === activeAnchor;
            const isActive = isRouteActive || isAnchorActive;

            return (
              <Link
                key={link.href}
                href={link.href}
                ref={(el) => {
                  if (el) linkRefs.current.set(link.href, el);
                  else linkRefs.current.delete(link.href);
                }}
                aria-current={isActive ? 'page' : undefined}
                data-active={isActive ? 'true' : 'false'}
                onMouseEnter={() => handleLinkEnter(link.href)}
                onFocus={() => handleLinkEnter(link.href)}
                className="glass-nav-link"
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions - Theme button + Join room + Play + Mobile menu button */}
        <div className="justify-self-end flex items-center gap-2 pr-2">
          {/* Theme button & popover menu (visible at 900px and up) */}
          <div className="hidden min-[900px]:inline-flex">
            <ThemeMenu />
          </div>

          {/* Join room: Popover with InputOTP (visible at 1024px and up; in menu below 1024px) */}
          <Popover open={joinPopoverOpen} onOpenChange={setJoinPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:inline-flex h-10 px-3.5 text-[15px] font-medium text-[var(--foreground)] rounded-full border border-transparent hover:border-[var(--glass-control-hover-border)] hover:bg-[var(--glass-control-hover-fill)] glass-control-hover glass-text-halo"
              >
                Join room
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-80 p-5 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] shadow-xl"
            >
              <div className="text-sm font-semibold font-display text-[var(--foreground)] mb-1">
                Join a Room
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mb-4">
                Enter a 6-character room code to join instantly
              </p>
              <div className="flex justify-center mb-4">
                <InputOTP
                  maxLength={6}
                  value={joinCode}
                  onChange={(val) => setJoinCode(val.toUpperCase())}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  aria-label="Enter 6-character room code"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full font-semibold h-10 rounded-full"
                disabled={joinCode.length < 4}
                onClick={handleJoinSubmit}
              >
                Join Game <ArrowRight size={14} className="ml-1" />
              </Button>
            </PopoverContent>
          </Popover>

          {/* Play: Primary button, 40px, fully rounded, flat accent fill */}
          <Link href="/room/create" className="shrink-0">
            <Button
              variant="primary"
              size="sm"
              className="h-10 px-4 text-[15px] font-semibold gap-1.5 rounded-full glass-play-btn"
            >
              <Play size={14} weight="fill" />
              <span>Play</span>
            </Button>
          </Link>

          {/* Mobile menu toggle (visible below 1024px) */}
          <div className="inline-flex lg:hidden">
            <button
              ref={mobileToggleRef}
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-panel"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileMenuOpen((v) => !v)}
              className={cn(
                'w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center border transition-all duration-150 outline-none select-none cursor-pointer relative',
                'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                mobileMenuOpen
                  ? 'bg-[var(--glass-control-hover-fill)] text-[var(--foreground)] border-[var(--glass-control-hover-border)] shadow-xs'
                  : 'bg-[var(--glass-control-bg)] text-[var(--foreground)] border-[var(--glass-control-border)] hover:bg-[var(--glass-control-hover-fill)] hover:border-[var(--glass-control-hover-border)]'
              )}
            >
              {/* 44px hit area */}
              <span className="absolute -inset-1 rounded-full pointer-events-auto" aria-hidden="true" />
              {mobileMenuOpen ? (
                <X size={18} weight="bold" />
              ) : (
                <List size={18} weight="bold" />
              )}
            </button>
          </div>
        </div>
      </nav>
      </div>
      </Container>

      {/* Mobile navigation panel anchored under the bar */}
      <MobileNavPanel
        isOpen={mobileMenuOpen}
        onClose={handleCloseMobile}
        toggleButtonRef={mobileToggleRef}
      />
    </header>
  );
});
