'use client';

import React from 'react';
import Link from 'next/link';
import { GithubLogo } from '@phosphor-icons/react';
import { Logo } from '@/components/shared/logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-1)]/60 backdrop-blur-xl py-12 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[var(--border)]">
          {/* Wordmark + one line description */}
          <div className="md:col-span-6 flex flex-col items-start text-left">
            <Logo size="sm" />
            <p className="text-sm text-[var(--muted-foreground)] mt-3 max-w-sm leading-relaxed">
              Real-time music trivia rooms for competitive listeners. Hear the clip, name it first, and climb the boards.
            </p>
          </div>

          {/* Two short link columns matching nav vocabulary */}
          <div className="md:col-span-3 flex flex-col gap-2.5 text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
              Product
            </span>
            <Link
              href="/room/create"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Play
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/achievements"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Achievements
            </Link>
          </div>

          <div className="md:col-span-3 flex flex-col gap-2.5 text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
              Community
            </span>
            <a
              href="https://github.com/shobhitsahani/music-trivia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <GithubLogo size={16} weight="duotone" /> GitHub Repository
            </a>
          </div>
        </div>

        {/* Bottom Bar: data-source line + copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted-foreground)] gap-3 text-center sm:text-left">
          <p>Audio previews provided by Apple Music and iTunes official previews.</p>
          <p>© {currentYear} SongGame. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}