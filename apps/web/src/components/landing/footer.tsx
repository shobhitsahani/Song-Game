'use client';

import Link from 'next/link';
import {
  GithubLogo,
  TwitterLogo,
  Heart,
} from '@phosphor-icons/react';
import { Logo } from '@/components/shared/logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Start a round', href: '/room/create' },
      { label: 'Join with code', href: '/room/join' },
      { label: 'Leaderboard', href: '/leaderboard' },
      { label: 'Achievements', href: '/achievements' },
    ],
    Community: [
      { label: 'GitHub', href: 'https://github.com/shobhitsahani/music-trivia', external: true },
      { label: 'Twitter', href: 'https://twitter.com', external: true },
    ],
  };

  return (
    <footer className="border-t border-[var(--glass-border)] bg-[var(--background)]/70 backdrop-blur-xl relative overflow-hidden py-14 px-4 sm:px-8 mb-20 md:mb-0">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Logo size="md" />
          <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-sm">
            A late-night listening room for music fans. Challenge friends, test your ear, and climb the boards.
          </p>
        </div>

        <div className="flex items-center gap-8 text-sm">
          {footerLinks.Product.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 text-[var(--muted-foreground)]">
          <a
            href="https://github.com/shobhitsahani/music-trivia"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="p-2 rounded-xl hover:bg-[var(--glass-bg)] hover:text-[var(--foreground)] transition-colors"
          >
            <GithubLogo size={22} weight="duotone" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter profile"
            className="p-2 rounded-xl hover:bg-[var(--glass-bg)] hover:text-[var(--foreground)] transition-colors"
          >
            <TwitterLogo size={22} weight="duotone" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[var(--glass-border)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted-foreground)] gap-2">
        <p>© {currentYear} Song Game. All audio previews powered by official previews.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart size={14} weight="fill" className="text-[var(--primary)]" /> in Liquid Glass.
        </p>
      </div>
    </footer>
  );
}