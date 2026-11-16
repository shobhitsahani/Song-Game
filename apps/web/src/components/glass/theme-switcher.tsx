'use client';

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Sparkle } from '@phosphor-icons/react';
import { clsx } from 'clsx';

export type Theme = 'black' | 'rose' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme, event?: React.MouseEvent) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEMES: { id: Theme; label: string; swatch: string }[] = [
  { id: 'light', label: 'Daylight', swatch: 'bg-[#2b5cf6]' },
  { id: 'black', label: 'Vinyl', swatch: 'bg-[#f59e0b]' },
  { id: 'rose', label: 'Rose', swatch: 'bg-[#ec4899]' },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Read persisted theme or URL param
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme') as Theme | null;
    const saved = (urlTheme && (urlTheme === 'black' || urlTheme === 'rose' || urlTheme === 'light'))
      ? urlTheme
      : (localStorage.getItem('song-game-theme-v2') as Theme | null);

    if (saved && (saved === 'black' || saved === 'rose' || saved === 'light')) {
      setThemeState(saved);
      document.documentElement.setAttribute('data-theme', saved);
      document.documentElement.style.colorScheme = saved === 'light' ? 'light' : 'dark';
    } else {
      // Fallback default for new visitors is always Daylight ('light')
      const initial: Theme = 'light';
      setThemeState(initial);
      document.documentElement.setAttribute('data-theme', initial);
      document.documentElement.style.colorScheme = 'light';
    }
  }, []);

  const setTheme = (newTheme: Theme, event?: React.MouseEvent) => {
    const update = () => {
      setThemeState(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.documentElement.style.colorScheme = newTheme === 'light' ? 'light' : 'dark';
      localStorage.setItem('song-game-theme-v2', newTheme);
      document.cookie = `song-game-theme-v2=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;

      // Update meta theme-color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      const themeColors: Record<Theme, string> = {
        black: '#121016',
        rose: '#241219',
        light: '#f8fafc',
      };
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeColors[newTheme]);
      }
    };

    // View Transitions circular reveal if supported
    const doc = document as unknown as {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };

    if (doc.startViewTransition && event) {
      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = doc.startViewTransition(() => {
        startTransition(() => {
          update();
        });
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 350,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      update();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Theme selector"
      className={clsx(
        'relative inline-flex items-center gap-1 p-1 rounded-[var(--radius-control,10px)] bg-[var(--surface-2)] border border-[var(--border)] shadow-xs select-none',
        className
      )}
    >
      {THEMES.map((t) => {
        const isActive = theme === t.id;

        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${t.label} theme`}
            onClick={(e) => setTheme(t.id, e)}
            className={clsx(
              'relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm,6px)] text-xs font-semibold transition-[color,background-color] duration-100 outline-none cursor-pointer',
              isActive
                ? 'text-[var(--foreground)] font-bold'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeThemeLens"
                className="absolute inset-0 rounded-[var(--radius-sm,6px)] bg-[var(--surface-1)] shadow-xs border border-[var(--border)] -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span
              className={clsx('w-2.5 h-2.5 rounded-full shrink-0 border border-black/10 dark:border-white/20', t.swatch)}
              aria-hidden="true"
            />
            <span className="text-[13px]">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}


