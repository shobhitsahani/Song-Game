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
  theme: 'black',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const THEMES: { id: Theme; label: string; icon: typeof Sun; swatch: string }[] = [
  { id: 'black', label: 'Vinyl', icon: Moon, swatch: 'bg-amber-400' },
  { id: 'rose', label: 'Rose', icon: Sparkle, swatch: 'bg-pink-500' },
  { id: 'light', label: 'Daylight', icon: Sun, swatch: 'bg-blue-500' },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('black');
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Read persisted theme or URL param or prefers-color-scheme
    const params = new URLSearchParams(window.location.search);
    const urlTheme = params.get('theme') as Theme | null;
    const saved = (urlTheme && (urlTheme === 'black' || urlTheme === 'rose' || urlTheme === 'light'))
      ? urlTheme
      : ((localStorage.getItem('app-theme') || localStorage.getItem('song-game-theme')) as Theme | null);

    if (saved && (saved === 'black' || saved === 'rose' || saved === 'light')) {
      setThemeState(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      const initial: Theme = 'black';
      setThemeState(initial);
      document.documentElement.setAttribute('data-theme', initial);
    }
  }, []);

  const setTheme = (newTheme: Theme, event?: React.MouseEvent) => {
    const update = () => {
      setThemeState(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('app-theme', newTheme);
      localStorage.setItem('song-game-theme', newTheme);

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
        'relative flex items-center gap-1 p-1 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-lg backdrop-blur-md',
        className
      )}
    >
      {THEMES.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.id;

        return (
          <button
            key={t.id}
            role="radio"
            aria-checked={isActive}
            aria-label={`${t.label} theme`}
            onClick={(e) => setTheme(t.id, e)}
            className={clsx(
              'relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 outline-none',
              isActive
                ? 'text-[var(--foreground)] font-semibold'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeThemePill"
                className="absolute inset-0 rounded-full bg-[var(--card)] shadow-sm border border-[var(--glass-border)] -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span
              className={clsx('w-2 h-2 rounded-full shrink-0', t.swatch)}
              aria-hidden="true"
            />
            <Icon size={14} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

