'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Disc,
  Heart,
  Timer,
  Microphone,
  Calendar,
  User,
  VinylRecord,
  SpeakerHigh,
  Check,
} from '@phosphor-icons/react';
import { Window } from '../stageshow/kit';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';

interface GameMode {
  num: string;
  key: string;
  title: string;
  rules: string;
  badge?: string;
  icon: typeof Disc;
  settings: {
    timer: string;
    lives: string;
    target: string;
    scoring: string;
  };
}

const GAME_MODES: GameMode[] = [
  {
    num: '01',
    key: 'CLASSIC',
    title: 'Classic',
    rules: 'Name the song title from 15-second audio snippets across all playlists.',
    icon: Disc,
    settings: {
      timer: '15 seconds',
      lives: 'Unlimited',
      target: 'Song title',
      scoring: 'Up to 1,000 pts / speed',
    },
  },
  {
    num: '02',
    key: 'SURVIVAL',
    title: 'Survival',
    rules: 'Sudden-death elimination: miss one track and you are knocked out of the room.',
    badge: 'Knockout',
    icon: Heart,
    settings: {
      timer: '15 seconds',
      lives: '1 Life only',
      target: 'Song title',
      scoring: 'Elimination on miss',
    },
  },
  {
    num: '03',
    key: 'HARDCORE',
    title: 'Hardcore',
    rules: 'Compressed 10-second timer with zero room for second guesses.',
    badge: 'Blitz',
    icon: Timer,
    settings: {
      timer: '10 seconds (blitz)',
      lives: '1 Life',
      target: 'Song title',
      scoring: '1.5x score multiplier',
    },
  },
  {
    num: '04',
    key: 'LYRICS',
    title: 'Lyrics',
    rules: 'Identify the track from missing lyrics and vocal phrases.',
    icon: Microphone,
    settings: {
      timer: '15 seconds',
      lives: 'Unlimited',
      target: 'Missing lyric phrase',
      scoring: 'Up to 1,000 pts',
    },
  },
  {
    num: '05',
    key: 'DECADE',
    title: 'Decade',
    rules: 'Filter clips strictly to your era, from 70s rock to modern 2020s hits.',
    badge: 'Filtered',
    icon: Calendar,
    settings: {
      timer: '15 seconds',
      lives: 'Unlimited',
      target: '1970s – 2020s hits',
      scoring: 'Era-calibrated points',
    },
  },
  {
    num: '06',
    key: 'ARTIST',
    title: 'Artist',
    rules: 'Name the vocalist, band, or producer behind the track instead of the song.',
    icon: User,
    settings: {
      timer: '15 seconds',
      lives: 'Unlimited',
      target: 'Artist / Producer',
      scoring: 'Up to 1,000 pts',
    },
  },
  {
    num: '07',
    key: 'ALBUM',
    title: 'Album',
    rules: 'Pick the exact studio album or LP release where the track first debuted.',
    icon: VinylRecord,
    settings: {
      timer: '15 seconds',
      lives: 'Unlimited',
      target: 'Studio album / LP',
      scoring: 'Up to 1,000 pts',
    },
  },
  {
    num: '08',
    key: 'GENRE',
    title: 'Genre',
    rules: 'Target specific soundscapes: Pop Hits, Classic Rock, Hip-Hop, Indie, Electronic.',
    badge: 'Filtered',
    icon: SpeakerHigh,
    settings: {
      timer: '15 seconds',
      lives: 'Unlimited',
      target: 'Selected genre',
      scoring: 'Up to 1,000 pts',
    },
  },
];

export function EightWaysToPlay() {
  const [activeKey, setActiveKey] = useState('CLASSIC');
  const activeMode = GAME_MODES.find((m) => m.key === activeKey) || GAME_MODES[0];
  const ActiveIcon = activeMode.icon;

  return (
    <section id="modes" className="relative landing-section scroll-mt-[88px]">
      <Container>
        {/* Section heading */}
        <div className="landing-heading-group">
          <h2 className="landing-h2">
            Eight ways to play
          </h2>
          <p className="landing-subline">
            From party casual to sudden-death elimination. Choose your rules before opening the room.
          </p>
        </div>

      {/* Tracklist layout: 8 rows left, 1 browser still preview right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start border-t border-[var(--border)] pt-10">
        {/* Left Column (7 of 12): Tracklist rows */}
        <div
          role="list"
          aria-label="Game modes tracklist"
          className="lg:col-span-7 flex flex-col divide-y divide-[var(--border)] border border-[var(--border)] rounded-[var(--radius-card)] bg-[var(--surface-1)] p-2 shadow-xs"
        >
          {GAME_MODES.map((mode) => {
            const isSelected = mode.key === activeKey;
            const Icon = mode.icon;

            return (
              <Link
                key={mode.key}
                role="listitem"
                href={`/room/create?mode=${mode.key}`}
                onMouseEnter={() => setActiveKey(mode.key)}
                onFocus={() => setActiveKey(mode.key)}
                className={cn(
                  'group flex items-center justify-between py-3 px-3.5 rounded-[var(--radius-control)] transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                  isSelected
                    ? 'bg-[var(--surface-2)] text-[var(--foreground)] shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]/60'
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="font-mono text-xs font-bold text-[var(--muted-foreground)] tabular-nums w-5 shrink-0">
                    {mode.num}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                        {mode.title}
                      </span>
                      {mode.badge && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-3)] text-[var(--muted-foreground)]">
                          {mode.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
                      {mode.rules}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Icon
                    size={18}
                    className={cn(
                      'transition-colors',
                      isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)] opacity-60'
                    )}
                  />
                  <ArrowRight
                    size={14}
                    weight="bold"
                    className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right Column (5 of 12): ONE Stageshow Browser Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 w-full">
          <div aria-hidden="true" className="w-full">
            <Window
              tabs={['SongGame — Setup']}
              nav
              url={
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                  <span>https://songgame.app/room/create</span>
                </span>
              }
              urlShape="pill"
              chrome="native"
              lights="color"
              className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--radius-card)] shadow-md overflow-hidden"
            >
              <div className="p-4 sm:p-5 flex flex-col gap-4">
                {/* Mode Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[var(--radius-control)] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-xs">
                      <ActiveIcon size={18} weight="fill" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--foreground)] font-sans flex items-center gap-2">
                        {activeMode.title} Mode
                      </div>
                      <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                        Rule Preset {activeMode.num} of 08
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)]">
                    Ready
                  </span>
                </div>

                {/* Mode Rules description */}
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed bg-[var(--surface-2)] p-3 rounded-[var(--radius-control)] border border-[var(--border)]">
                  {activeMode.rules}
                </p>

                {/* Setting Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-mono block mb-1">
                      Clip Timer
                    </span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {activeMode.settings.timer}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-mono block mb-1">
                      Lives / Survival
                    </span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {activeMode.settings.lives}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-mono block mb-1">
                      Answer Target
                    </span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {activeMode.settings.target}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-mono block mb-1">
                      Scoring Rule
                    </span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {activeMode.settings.scoring}
                    </span>
                  </div>
                </div>

                {/* Faux Launch Button */}
                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <Check size={14} weight="bold" />
                    <span>Lobby config verified</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                    /room/create?mode={activeMode.key}
                  </span>
                </div>
              </div>
            </Window>
          </div>
        </div>
      </div>
      </Container>
    </section>
  );
}