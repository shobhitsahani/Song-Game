'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { useTheme, type Theme } from '@/components/glass/theme-switcher';
import { JoinRoomModal } from './join-room-modal';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/room/create', label: 'Play', icon: Play },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/achievements', label: 'Achievements', icon: Star },
];

const THEME_OPTIONS: { id: Theme; label: string; icon: typeof Moon; dot: string }[] = [
  { id: 'black', label: 'Vinyl', icon: Moon, dot: 'bg-amber-400' },
  { id: 'rose', label: 'Rose', icon: Sparkle, dot: 'bg-rose-500' },
  { id: 'light', label: 'Daylight', icon: Sun, dot: 'bg-blue-600' },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentThemeOpt = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const ThemeIcon = currentThemeOpt.icon;

  return (
    <>
      <header className="fixed top-3 sm:top-4 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-[1200px] mx-auto pointer-events-auto">
          {/* One floating glass bar, 56px tall default (h-14), 48px on scroll > 8px (h-12) */}
          <div
            className={cn(
              'w-full flex items-center justify-between rounded-full border border-[var(--glass-border)] transition-all duration-300',
              scrolled
                ? 'h-12 px-4 shadow-xl backdrop-blur-2xl bg-[var(--surface-1)]/90'
                : 'h-14 px-5 shadow-lg backdrop-blur-xl bg-[var(--glass-bg)]'
            )}
          >
            {/* Left: wordmark */}
            <div className="flex items-center">
              <Logo size="sm" />
            </div>

            {/* Center: Play, Leaderboard, Achievements (Desktop) */}
            <nav
              aria-label="Main Navigation"
              className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[var(--surface-1)]/60 border border-[var(--glass-border)]"
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
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 rounded-full bg-[var(--surface-2)] shadow-sm border border-[var(--glass-border)] -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      />
                    )}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Theme popover + Join room ghost + Play primary (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {/* Theme popover with 3 swatches */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Current theme: ${currentThemeOpt.label}. Open theme menu`}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--surface-1)] border border-[var(--glass-border)] text-[var(--foreground)] hover:border-[var(--glass-highlight)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    <ThemeIcon size={16} weight="duotone" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-2 rounded-2xl">
                  <div className="text-xs font-mono font-bold text-[var(--muted-foreground)] px-2 py-1 mb-1 uppercase tracking-wider">
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
                            'flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-colors outline-none',
                            isSelected
                              ? 'bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--glass-border)]'
                              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn('w-2.5 h-2.5 rounded-full', t.dot)} />
                            <span>{t.label}</span>
                          </div>
                          <Icon size={14} weight={isSelected ? 'fill' : 'regular'} />
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Join room ghost button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowJoinModal(true)}
                className="h-9 px-3 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Join room
              </Button>

              {/* Play primary button */}
              <Link href="/room/create">
                <Button
                  variant="primary"
                  size="sm"
                  className="h-9 px-4 text-xs font-bold rounded-full shadow-md"
                >
                  <Play size={14} weight="fill" /> Play
                </Button>
              </Link>
            </div>

            {/* Mobile Nav: Play + Hamburger Sheet */}
            <div className="md:hidden flex items-center gap-2">
              <Link href="/room/create">
                <Button
                  variant="primary"
                  size="sm"
                  className="h-8 px-3 text-xs font-bold rounded-full shadow-sm"
                >
                  <Play size={13} weight="fill" /> Play
                </Button>
              </Link>

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open navigation menu"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface-1)] border border-[var(--glass-border)] text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    <List size={18} weight="bold" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-6 flex flex-col justify-between">
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
                          setShowJoinModal(true);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-left"
                      >
                        <ArrowRight size={18} weight="bold" />
                        <span>Join room</span>
                      </button>
                    </div>
                  </div>

                  {/* Theme swatches in sheet */}
                  <div className="pt-6 border-t border-[var(--border)]">
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
                                : 'bg-[var(--surface-1)] border-[var(--border)] text-[var(--muted-foreground)]'
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
          </div>
        </div>
      </header>

      <JoinRoomModal open={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </>
  );
}
