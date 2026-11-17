'use client';

import React from 'react';
import Link from 'next/link';
import { GithubLogo } from '@phosphor-icons/react';
import { Logo } from '@/components/shared/logo';
import { Container } from '@/components/ui/container';
import { REPO_URL } from '@/lib/site';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-1)]/60 backdrop-blur-xl pt-16 sm:pt-20 pb-12 mt-12">
      <Container>
        {/* 12-column grid aligned to page grid lines */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[var(--border)]">
          {/* Brand: 4 columns, description max 44ch */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col items-start text-left">
            <Logo size="sm" />
            <p className="text-[14px] text-[var(--muted-foreground)] mt-3 max-w-[44ch] leading-relaxed">
              Real-time music trivia rooms for competitive listeners. Hear the clip, name it first, and climb the boards.
            </p>
          </div>

          {/* Product Links: aligned to grid */}
          <div className="md:col-span-3 lg:col-span-3 lg:col-start-6 flex flex-col gap-2.5 text-left">
            <span className="text-[13px] font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
              Product
            </span>
            <Link
              href="/room/create"
              className="text-[14px] sm:text-[15px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-[var(--radius-sm)] py-0.5"
            >
              Play
            </Link>
            <Link
              href="/leaderboard"
              className="text-[14px] sm:text-[15px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-[var(--radius-sm)] py-0.5"
            >
              Leaderboard
            </Link>
            <Link
              href="/achievements"
              className="text-[14px] sm:text-[15px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-[var(--radius-sm)] py-0.5"
            >
              Achievements
            </Link>
          </div>

          {/* Community Links: aligned to grid */}
          <div className="md:col-span-4 lg:col-span-3 lg:col-start-10 flex flex-col gap-2.5 text-left">
            <span className="text-[13px] font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
              Community
            </span>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[14px] sm:text-[15px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-[var(--radius-sm)] py-0.5"
            >
              <GithubLogo size={18} weight="duotone" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar: data-source line + copyright (13px) */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[13px] text-[var(--muted-foreground)] gap-3 text-center sm:text-left">
          <p>Audio previews provided by Apple Music and iTunes official previews.</p>
          <p>© {currentYear} SongGame. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
