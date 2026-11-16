'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Check, X } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from '@/components/ui/input-otp';
import { useTheme, type Theme } from '@/components/glass/theme-switcher';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
}

const LINKS = [
  { href: '/#how', label: 'How it works', anchor: true },
  { href: '/#modes', label: 'Modes', anchor: true },
  { href: '/leaderboard', label: 'Leaderboard', anchor: false },
];

const THEMES: { id: Theme; label: string; swatchBg: string; swatchBorder: string; accentDot: string }[] = [
  {
    id: 'black',
    label: 'Vinyl',
    swatchBg: '#16141d',
    swatchBorder: 'rgba(255, 255, 255, 0.2)',
    accentDot: '#f59e0b',
  },
  {
    id: 'rose',
    label: 'Rose',
    swatchBg: '#28111c',
    swatchBorder: 'rgba(236, 72, 153, 0.3)',
    accentDot: '#ec4899',
  },
  {
    id: 'light',
    label: 'Daylight',
    swatchBg: '#f8fafc',
    swatchBorder: 'rgba(0, 0, 0, 0.15)',
    accentDot: '#2b5cf6',
  },
];

export function MobileNavPanel({ isOpen, onClose, toggleButtonRef }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);

  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Close only on actual route change
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    // Move focus into first item
    const timer = setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        toggleButtonRef.current?.focus();
        return;
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, toggleButtonRef]);

  // Outside click handling
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, onClose, toggleButtonRef]);

  const handleLinkClick = (href: string, isAnchor: boolean) => {
    onClose();
    if (isAnchor && pathname === '/') {
      const id = href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleJoin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = joinCode.trim().toUpperCase();
    if (clean.length >= 4) {
      onClose();
      router.push(`/room/${clean}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      id="mobile-nav-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      style={{
        top: 'calc(72px + env(safe-area-inset-top, 0px))',
      }}
      className={cn(
        'fixed left-4 right-4 z-50 max-w-[1200px] mx-auto rounded-[24px] p-4 sm:p-5 border border-[var(--border)] shadow-2xl overflow-y-auto max-h-[calc(100dvh-100px)] pointer-events-auto',
        'bg-[var(--card)]/95 backdrop-blur-2xl',
        'animate-in fade-in-0 zoom-in-95 duration-200 motion-reduce:animate-none'
      )}
    >
      {/* 3 Navigation links as 48px rows */}
      <div className="flex flex-col space-y-1">
        {LINKS.map((link, idx) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              ref={idx === 0 ? firstFocusableRef : undefined}
              href={link.href}
              onClick={() => handleLinkClick(link.href, link.anchor)}
              className={cn(
                'min-h-[48px] h-12 flex items-center px-4 rounded-[var(--radius-control,10px)] text-[15px] font-semibold transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
                isActive
                  ? 'bg-[var(--surface-2)] text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]/60'
              )}
            >
              {link.label}
            </Link>
          );
        })}

        {/* Join room 48px row */}
        {!showJoinInput ? (
          <button
            type="button"
            onClick={() => setShowJoinInput(true)}
            className="min-h-[48px] h-12 flex items-center justify-between px-4 rounded-[var(--radius-control,10px)] text-[15px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]/60 transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer"
          >
            <span>Have a room code?</span>
            <span className="text-xs font-mono font-medium text-[var(--primary)] flex items-center gap-1">
              Join room <ArrowRight size={13} weight="bold" />
            </span>
          </button>
        ) : (
          <form
            onSubmit={handleJoin}
            className="p-3 rounded-[var(--radius-control,10px)] bg-[var(--surface-2)] border border-[var(--border)] flex flex-col gap-2.5 animate-in fade-in-0 duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--foreground)]">Enter 6-char code</span>
              <button
                type="button"
                onClick={() => setShowJoinInput(false)}
                className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Cancel code entry"
              >
                <X size={14} weight="bold" />
              </button>
            </div>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={joinCode}
                onChange={(val) => setJoinCode(val.toUpperCase())}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                aria-label="Room code"
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
              type="submit"
              size="sm"
              variant="primary"
              className="w-full h-10 font-semibold"
              disabled={joinCode.trim().length < 4}
            >
              Join Room
            </Button>
          </form>
        )}
      </div>

      {/* Theme selection section */}
      <div className="mt-4 pt-3.5 border-t border-[var(--border)]">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] block px-4 mb-2">
          Theme
        </span>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={(e) => setTheme(t.id, e)}
                className={cn(
                  'min-h-[44px] h-11 flex items-center justify-center gap-2 px-3 rounded-[var(--radius-control,10px)] text-xs font-semibold border transition-all cursor-pointer outline-none',
                  'focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                  isSelected
                    ? 'bg-[var(--surface-2)] text-[var(--foreground)] border-[var(--primary)] font-bold shadow-xs'
                    : 'bg-[var(--surface-1)] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-[var(--surface-2)]/60'
                )}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: t.swatchBg,
                    borderColor: t.swatchBorder,
                  }}
                  aria-hidden="true"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: t.accentDot }}
                  />
                </span>
                <span>{t.label}</span>
                {isSelected && <Check size={12} weight="bold" className="text-[var(--primary)]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
