'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Play, Trophy, Star, List, ArrowRight } from '@phosphor-icons/react';
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
import { ThemeSwitcher, useTheme, type Theme } from '@/components/glass/theme-switcher';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/room/create', label: 'Play', icon: Play },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/achievements', label: 'Achievements', icon: Star },
];

export const Navbar = React.memo(function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [joinPopoverOpen, setJoinPopoverOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const handleJoinSubmit = () => {
    const trimmed = joinCode.trim().toUpperCase();
    if (trimmed.length >= 4) {
      setJoinPopoverOpen(false);
      setJoinCode('');
      router.push(`/room/${trimmed}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: wordmark */}
        <div className="flex items-center gap-8">
          <Logo size="sm" />

          {/* Center / Left Navigation (Desktop) - 15px clean text */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-1"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3.5 py-1.5 rounded-[var(--radius-control)] text-[15px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                    isActive
                      ? 'text-[var(--foreground)] font-semibold bg-[var(--surface-2)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: ThemeSwitcher + Join room popover + Play button (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeSwitcher />

          {/* Join room: popover with InputOTP */}
          <Popover open={joinPopoverOpen} onOpenChange={setJoinPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="font-medium text-[14px]">
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
                className="w-full font-semibold"
                disabled={joinCode.length < 4}
                onClick={handleJoinSubmit}
              >
                Join Game <ArrowRight size={14} className="ml-1" />
              </Button>
            </PopoverContent>
          </Popover>

          {/* Play: Primary button */}
          <Link href="/room/create">
            <Button variant="primary" size="sm" className="gap-1.5 font-semibold text-[14px]">
              <Play size={13} weight="fill" />
              <span>Play</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Nav: Play + Hamburger Sheet */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/room/create">
            <Button variant="primary" size="sm" className="h-9 px-3 text-xs gap-1">
              <Play size={12} weight="fill" />
              <span>Play</span>
            </Button>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-9 h-9"
                aria-label="Open navigation menu"
              >
                <List size={18} weight="bold" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 p-6 flex flex-col justify-between border-l border-[var(--border)] bg-[var(--card)]"
            >
              <div>
                <SheetHeader className="text-left mb-6">
                  <SheetTitle>
                    <Logo size="sm" />
                  </SheetTitle>
                </SheetHeader>

                {/* Navigation links */}
                <div className="flex flex-col gap-1.5">
                  {NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-control)] text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-[var(--surface-2)] text-[var(--foreground)] font-semibold'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)]'
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
                    className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-control)] text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-1)] transition-colors text-left"
                  >
                    <ArrowRight size={18} weight="bold" />
                    <span>Join room</span>
                  </button>
                </div>
              </div>

              {/* Theme swatches in sheet */}
              <div className="pt-6 border-t border-[var(--border)]">
                <span className="text-xs font-mono font-medium text-[var(--muted-foreground)] uppercase tracking-wider block mb-3">
                  Theme
                </span>
                <ThemeSwitcher className="w-full justify-between" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
});

