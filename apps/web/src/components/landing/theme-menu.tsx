'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check } from '@phosphor-icons/react';
import { useTheme, type Theme } from '@/components/glass/theme-switcher';
import { cn } from '@/lib/utils';

interface ThemeOption {
  id: Theme;
  label: string;
  desc: string;
  swatchBg: string;
  swatchBorder: string;
  accentDot: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'black',
    label: 'Vinyl',
    desc: 'Charcoal & Amber',
    swatchBg: '#16141d',
    swatchBorder: 'rgba(255, 255, 255, 0.2)',
    accentDot: '#f59e0b',
  },
  {
    id: 'rose',
    label: 'Rose',
    desc: 'Deep Berry & Pink',
    swatchBg: '#28111c',
    swatchBorder: 'rgba(236, 72, 153, 0.3)',
    accentDot: '#ec4899',
  },
  {
    id: 'light',
    label: 'Daylight',
    desc: 'Clean Paper & Blue',
    swatchBg: '#f8fafc',
    swatchBorder: 'rgba(0, 0, 0, 0.15)',
    accentDot: '#2b5cf6',
  },
];

export function ThemeMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const activeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[2];

  // Set focused index to active theme when opened
  useEffect(() => {
    if (isOpen) {
      const idx = THEME_OPTIONS.findIndex((t) => t.id === theme);
      setFocusedIndex(idx >= 0 ? idx : 0);
      requestAnimationFrame(() => {
        itemsRef.current[idx >= 0 ? idx : 0]?.focus();
      });
    }
  }, [isOpen, theme]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (selectedTheme: Theme, e?: React.MouseEvent) => {
    setTheme(selectedTheme, e);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = (prev + 1) % THEME_OPTIONS.length;
            itemsRef.current[next]?.focus();
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = (prev - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
            itemsRef.current[next]?.focus();
            return next;
          });
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          itemsRef.current[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(THEME_OPTIONS.length - 1);
          itemsRef.current[THEME_OPTIONS.length - 1]?.focus();
          break;
        case 'Tab':
          setIsOpen(false);
          break;
        default:
          break;
      }
    },
    [isOpen]
  );

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      {/* 40px round icon button */}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Theme menu, current theme ${activeOption.label}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-150 outline-none select-none cursor-pointer glass-control-hover',
          'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          isOpen
            ? 'bg-[var(--surface-2)] text-[var(--foreground)] border-[var(--border)] shadow-xs'
            : 'bg-[var(--surface-1)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-2)] hover:border-[var(--border)]'
        )}
      >
        {/* Half-filled circle glyph representing the current theme's swatch */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.75" />
          <path d="M10 2 A8 8 0 0 1 10 18 Z" fill="currentColor" />
        </svg>
      </button>

      {/* Floating theme popover menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Theme options"
          onKeyDown={handleKeyDown}
          className={cn(
            'absolute right-0 top-[calc(100%+8px)] z-50 w-52 p-1.5 rounded-[var(--radius-card,14px)] border border-[var(--border)] bg-[var(--card)] shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 outline-none select-none'
          )}
        >
          <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border)] mb-1">
            Theme
          </div>

          <div className="space-y-0.5">
            {THEME_OPTIONS.map((opt, i) => {
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  ref={(el) => {
                    itemsRef.current[i] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  tabIndex={focusedIndex === i ? 0 : -1}
                  onClick={(e) => handleSelect(opt.id, e)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm,6px)] text-xs font-semibold transition-colors duration-100 outline-none cursor-pointer',
                    'focus-visible:bg-[var(--surface-2)] focus-visible:text-[var(--foreground)]',
                    isSelected
                      ? 'bg-[var(--surface-2)] text-[var(--foreground)] font-bold'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--surface-2)]/60 hover:text-[var(--foreground)]'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Swatch circle with accent core */}
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: opt.swatchBg,
                        borderColor: opt.swatchBorder,
                      }}
                      aria-hidden="true"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: opt.accentDot }}
                      />
                    </span>
                    <span className="text-[13px]">{opt.label}</span>
                  </div>

                  {isSelected && (
                    <Check size={14} weight="bold" className="text-[var(--primary)] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
