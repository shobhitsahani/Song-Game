'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { cn } from '@/lib/utils';

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
  { href: '/achievements', label: 'Achievements' },
];

export const Navbar = React.memo(function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const [joinPopoverOpen, setJoinPopoverOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  // 1. Passive scroll listener to raise opacity and add shadow after 8px scroll
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 8);
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleJoinSubmit = () => {
    const trimmed = joinCode.trim().toUpperCase();
    if (trimmed.length >= 4) {
      setJoinPopoverOpen(false);
      setJoinCode('');
      router.push(`/room/${trimmed}`);
    }
  };

  return (
    <header className="sticky top-3 sm:top-4 z-40 w-full px-4 sm:px-6 lg:px-8 pointer-events-none">
      <nav
        aria-label="Primary"
        className={cn(
          'max-w-[1200px] w-full mx-auto h-14 p-2 rounded-full grid grid-cols-[1fr_auto] min-[900px]:grid-cols-[1fr_auto_1fr] items-center pointer-events-auto transition-[background-color,border-color,box-shadow,opacity] duration-200 border',
          scrolled
            ? 'bg-[var(--surface-1)]/95 shadow-md border-[var(--border)] backdrop-blur-md'
            : 'bg-[var(--surface-1)]/80 shadow-xs border-[var(--border)]/70 backdrop-blur-md'
        )}
        style={{
          backgroundColor: 'var(--nav-glass-bg)',
          borderColor: 'var(--nav-glass-border)',
          boxShadow: scrolled
            ? '0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.05)'
            : 'var(--nav-glass-shadow)',
        }}
      >
        {/* Left: Brand - 24-28px custom mark + 1-color display wordmark */}
        <div className="justify-self-start flex items-center pl-2">
          <Link
            href="/"
            aria-label="SongGame home"
            className="group inline-flex items-center gap-2.5 select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 rounded-full"
          >
            <NavLogoMark />
            <span className="font-display font-semibold text-[17px] tracking-[-0.01em] text-[var(--foreground)]">
              SongGame
            </span>
          </Link>
        </div>

        {/* Center: Links (Desktop) - 15px, medium weight, 36px capsule hover/active (collapses below 900px) */}
        <div className="justify-self-center hidden min-[900px]:flex items-center gap-1">
          {CENTER_LINKS.map((link) => {
            const isRouteActive = pathname === link.href;
            const isAnchorActive = pathname === '/' && link.anchorId === activeAnchor;
            const isActive = isRouteActive || isAnchorActive;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'h-9 px-3.5 rounded-full text-[15px] font-medium transition-colors inline-flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                  isActive
                    ? 'text-[var(--foreground)] font-semibold bg-[var(--surface-2)] shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]/60'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions - Theme button + Join room + Play + Mobile menu button */}
        <div className="justify-self-end flex items-center gap-2 pr-1">
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
                className="hidden lg:inline-flex h-10 px-3.5 text-[15px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-full"
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
              className="h-10 px-4 text-[15px] font-semibold gap-1.5 rounded-full"
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
                  ? 'bg-[var(--surface-2)] text-[var(--foreground)] border-[var(--border)] shadow-xs'
                  : 'bg-[var(--surface-1)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-2)]'
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

      {/* Mobile navigation panel anchored under the bar */}
      <MobileNavPanel
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        toggleButtonRef={mobileToggleRef}
      />
    </header>
  );
});
