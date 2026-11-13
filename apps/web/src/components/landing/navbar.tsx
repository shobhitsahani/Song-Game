'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Play,
  Trophy,
  Star,
  List,
  Moon,
  Sparkle,
  Sun,
  ArrowRight,
} from '@phosphor-icons/react';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from '@/components/ui/input-otp';
import { useTheme, type Theme } from '@/components/glass/theme-switcher';
import { GlassSurface } from '@/components/glass/glass-surface';
import { liquidSpring } from '@/lib/motion';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/room/create', label: 'Play', icon: Play },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/achievements', label: 'Achievements', icon: Star },
];

const THEME_OPTIONS: { id: Theme; label: string; icon: typeof Moon; dot: string }[] = [
  { id: 'light', label: 'Daylight', icon: Sun, dot: 'bg-blue-600' },
  { id: 'black', label: 'Vinyl', icon: Moon, dot: 'bg-amber-400' },
  { id: 'rose', label: 'Rose', icon: Sparkle, dot: 'bg-rose-500' },
];

export const Navbar = React.memo(function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [joinPopoverOpen, setJoinPopoverOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    let isScrolled = false;
    const handleScroll = () => {
      const y = window.scrollY;
      if (!isScrolled && y > 24) {
        isScrolled = true;
        setScrolled(true);
      } else if (isScrolled && y < 8) {
        isScrolled = false;
        setScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentThemeOpt = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const ThemeIcon = currentThemeOpt.icon;

  const handleJoinSubmit = () => {
    const trimmed = joinCode.trim().toUpperCase();
    if (trimmed.length >= 4) {
      setJoinPopoverOpen(false);
      setJoinCode('');
      router.push(`/room/${trimmed}`);
    }
  };

  return (
    <header
      className="fixed top-3 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none"
      style={{ isolation: 'isolate' }}
    >
      <div className="max-w-[1200px] mx-auto pointer-events-auto">
        {/* ONE floating capsule, constant 56px height to prevent reflow and map regeneration */}
        <GlassSurface
          variant="nav"
          radius="full"
          refraction={true}
          specularRim={true}
          className={cn(
            'w-full h-14 px-5 flex items-center justify-between transition-[box-shadow,border-color,background-color] duration-[80ms]',
            scrolled ? 'shadow-2xl border-[var(--glass-highlight)]' : 'shadow-xl'
          )}
        >
          {/* Left: wordmark with crisp vinyl mark */}
          <div className="flex items-center">
            <Logo size="sm" />
          </div>

          {/* Center: Main Navigation (Desktop) - No nested pill */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1.5"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                    isActive
                      ? 'text-[var(--foreground)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/[0.04]'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavLens"
                      className="absolute inset-0 rounded-full bg-[var(--nav-lens-bg)] border border-[var(--nav-lens-border)] shadow-[inset_0_1px_0_var(--glass-highlight)] -z-10"
                      transition={liquidSpring}
                    />
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Theme popover + Join room popover + Amber glass Play (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme 40px glass button & popover */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={`Current theme: ${currentThemeOpt.label}. Open theme menu`}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--foreground)] hover:border-[var(--glass-highlight)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] shadow-xs"
                >
                  <ThemeIcon size={17} weight="duotone" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--card)]/90 backdrop-blur-2xl shadow-2xl">
                <div className="text-[11px] font-mono font-bold text-[var(--muted-foreground)] px-2 py-1 mb-1 uppercase tracking-wider">
                  Theme
                </div>
                <div className="flex flex-col gap-1">
                  {THEME_OPTIONS.map((t) => {
                    const Icon = t.icon;
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={(e) => setTheme(t.id, e)}
                        className={cn(
                          'relative flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-colors outline-none z-0',
                          isSelected
                            ? 'text-[var(--foreground)]'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]'
                        )}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="themeSelectionRing"
                            className="absolute inset-0 rounded-xl bg-[var(--surface-2)] border border-[var(--glass-border)] -z-10 shadow-xs"
                            transition={liquidSpring}
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <span className={cn('w-2.5 h-2.5 rounded-full shadow-xs', t.dot)} />
                          <span>{t.label}</span>
                        </div>
                        <Icon size={14} weight={isSelected ? 'fill' : 'regular'} />
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Join room: glass popover with 6-slot InputOTP */}
            <Popover open={joinPopoverOpen} onOpenChange={setJoinPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="h-9 px-3.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--glass-bg)] transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  Join room
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--card)]/95 backdrop-blur-2xl shadow-2xl">
                <div className="text-sm font-bold font-display text-[var(--foreground)] mb-1">
                  Join a Room
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">
                  Enter 6-character room code to join instantly
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
                  className="w-full h-10 font-bold"
                  disabled={joinCode.length < 4}
                  onClick={handleJoinSubmit}
                >
                  Join Game <ArrowRight size={14} className="ml-1" />
                </Button>
              </PopoverContent>
            </Popover>

            {/* Play: Amber glass button with 80ms snap press */}
            <Link href="/room/create">
              <button
                type="button"
                className="glass-btn-amber h-9 px-4 text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] transition-[opacity,filter] duration-[80ms] active:opacity-85 active:brightness-95"
              >
                <Play size={13} weight="fill" />
                <span>Play</span>
              </button>
            </Link>
          </div>

          {/* Mobile Nav: Play + Hamburger Sheet */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/room/create">
              <button
                type="button"
                className="glass-btn-amber h-8 px-3 text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer outline-none transition-[opacity,filter] duration-[80ms] active:opacity-85 active:brightness-95"
              >
                <Play size={12} weight="fill" />
                <span>Play</span>
              </button>
            </Link>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open navigation menu"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <List size={18} weight="bold" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-6 flex flex-col justify-between border-l border-[var(--glass-border)] bg-[var(--card)]/95 backdrop-blur-2xl">
                <div>
                  <SheetHeader className="text-left mb-6">
                    <SheetTitle>
                      <Logo size="sm" />
                    </SheetTitle>
                  </SheetHeader>

                  {/* Navigation links */}
                  <div className="flex flex-col gap-2">
                    {NAV_LINKS.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors',
                            isActive
                              ? 'bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--glass-border)]'
                              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                          )}
                        >
                          <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setJoinPopoverOpen(true);
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-left"
                    >
                      <ArrowRight size={18} weight="bold" />
                      <span>Join room</span>
                    </button>
                  </div>
                </div>

                {/* Theme swatches in sheet */}
                <div className="pt-6 border-t border-[var(--glass-border)]">
                  <span className="text-xs font-mono font-bold text-[var(--muted-foreground)] uppercase tracking-wider block mb-3">
                    Theme
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {THEME_OPTIONS.map((t) => {
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={(e) => setTheme(t.id, e)}
                          className={cn(
                            'flex flex-col items-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-colors',
                            isSelected
                              ? 'bg-[var(--surface-2)] border-[var(--glass-highlight)] text-[var(--foreground)] font-bold'
                              : 'bg-[var(--surface-1)] border-[var(--glass-border)] text-[var(--muted-foreground)]'
                          )}
                        >
                          <span className={cn('w-3 h-3 rounded-full', t.dot)} />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </GlassSurface>
      </div>
    </header>
  );
});

