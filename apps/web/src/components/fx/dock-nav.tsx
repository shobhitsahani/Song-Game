'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { House, PlayCircle, Trophy, Gear } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { Logo } from '@/components/shared/logo';
import { ThemeSwitcher } from '@/components/glass/theme-switcher';
import { GlassSurface } from '@/components/glass/glass-surface';

interface NavItem {
  href: string;
  label: string;
  icon: typeof House;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: House },
  { href: '/room/create', label: 'Play', icon: PlayCircle },
  { href: '/leaderboard', label: 'Ranks', icon: Trophy },
  { href: '/profile', label: 'Settings', icon: Gear },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-4 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto">
        <GlassSurface
          variant="regular"
          radius="full"
          className="px-4 py-2 flex items-center gap-3 backdrop-blur-xl shadow-lg border border-[var(--glass-border)]"
        >
          <Logo size="sm" />
        </GlassSurface>

        {/* Desktop Center Nav */}
        <nav
          aria-label="Desktop Navigation"
          className="hidden md:flex items-center gap-1.5 p-1.5 rounded-full liquid-glass-surface bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-xl backdrop-blur-xl"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 outline-none',
                  isActive
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPillDesktop"
                    className="absolute inset-0 rounded-full bg-[var(--card)] shadow-sm border border-[var(--glass-border)] -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  />
                )}
                <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side ThemeSwitcher */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

export function MobileDockNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Dock Navigation"
      className="md:hidden fixed bottom-4 left-4 right-4 z-40 pointer-events-none pb-[env(safe-area-inset-bottom)]"
    >
      <GlassSurface
        variant="strong"
        radius="full"
        className="pointer-events-auto max-w-sm mx-auto flex items-center justify-around p-2 shadow-2xl border border-[var(--glass-border)] backdrop-blur-2xl"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-3 rounded-2xl text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                isActive
                  ? 'text-[var(--primary)] font-bold'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNavPillMobile"
                  className="absolute inset-0 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] -z-10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}
              <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </GlassSurface>
    </nav>
  );
}
