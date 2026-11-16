'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  SpeakerHigh,
  Heart,
  Timer,
  Microphone,
  Calendar,
  User,
  Disc,
  MusicNotes,
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
}

const GAME_MODES: GameMode[] = [
  {
    num: '01',
    key: 'CLASSIC',
    title: 'Classic',
    rules: 'Name the song title from 15-second audio snippets across all playlists.',
  },
  {
    num: '02',
    key: 'SURVIVAL',
    title: 'Survival',
    rules: 'Sudden-death elimination: miss one track and you are knocked out of the room.',
  },
  {
    num: '03',
    key: 'HARDCORE',
    title: 'Hardcore',
    rules: 'Compressed 10-second blitz timer with 1.5x points and zero room for second guesses.',
  },
  {
    num: '04',
    key: 'LYRICS',
    title: 'Lyrics',
    rules: 'Identify the track from missing lyrics and memorable vocal phrases.',
  },
  {
    num: '05',
    key: 'DECADE',
    title: 'Decade',
    rules: 'Filter clips strictly to your chosen era, from 70s rock to modern 2020s hits.',
  },
  {
    num: '06',
    key: 'ARTIST',
    title: 'Artist',
    rules: 'Name the vocalist, band, or producer behind the track instead of the song.',
  },
  {
    num: '07',
    key: 'ALBUM',
    title: 'Album',
    rules: 'Pick the exact studio album or LP release where the track first debuted.',
  },
  {
    num: '08',
    key: 'GENRE',
    title: 'Genre',
    rules: 'Target specific soundscapes: Pop Hits, Classic Rock, Hip-Hop, Indie, Electronic.',
  },
];

export function EightWaysToPlay() {
  const [activeKey, setActiveKey] = useState('CLASSIC');
  const activeMode = GAME_MODES.find((m) => m.key === activeKey) || GAME_MODES[0];

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

        {/* Tracklist layout: ~55% list left, ~45% sticky browser preview right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start border-t border-[var(--border)] pt-10">
          {/* Left Column (~55% = 7 of 12): Hairline Tracklist rows */}
          <div
            role="list"
            aria-label="Game modes tracklist"
            className="lg:col-span-7 flex flex-col divide-y divide-[var(--border)]"
          >
            {GAME_MODES.map((mode) => {
              const isSelected = mode.key === activeKey;

              return (
                <Link
                  key={mode.key}
                  role="listitem"
                  href={`/room/create?mode=${mode.key}`}
                  onMouseEnter={() => setActiveKey(mode.key)}
                  onFocus={() => setActiveKey(mode.key)}
                  className={cn(
                    'group flex items-center justify-between min-h-[64px] sm:min-h-[68px] py-3.5 px-3 rounded-[var(--radius-control)] transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                    isSelected
                      ? 'bg-[var(--surface-2)] shadow-xs'
                      : 'hover:bg-[var(--surface-2)]/60'
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    <span className="font-mono text-[13px] font-bold text-[var(--muted-foreground)] tabular-nums w-6 shrink-0">
                      {mode.num}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={cn(
                          'text-[17px] font-semibold transition-colors',
                          isSelected ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'
                        )}
                      >
                        {mode.title}
                      </span>
                      <p className="text-[14px] text-[var(--muted-foreground)] truncate mt-0.5">
                        {mode.rules}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center pl-2">
                    <ArrowRight
                      size={16}
                      weight="bold"
                      className={cn(
                        'transition-all duration-150',
                        isSelected
                          ? 'opacity-100 text-[var(--primary)] translate-x-0'
                          : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-[var(--muted-foreground)]'
                      )}
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Column (~45% = 5 of 12): Sticky Browser Pane (Hidden below 1024px) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-[80px] w-full">
            <div aria-hidden="true" className="w-full">
              <Window
                tabs={['SongGame — Setup']}
                nav
                url={
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--muted-foreground)]">
                    <span>https://songgame.app/room/create</span>
                  </span>
                }
                urlShape="rounded"
                chrome="native"
                lights="color"
                body={{ className: 'flex flex-col justify-between h-full' }}
                className="w-full bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--radius-card)] shadow-md overflow-hidden min-h-[540px] flex flex-col"
              >
                <div className="p-5 flex flex-col gap-4 flex-1">
                  {/* Pane Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                    <div>
                      <div className="text-[16px] font-bold text-[var(--foreground)] font-sans">
                        {activeMode.title} Mode
                      </div>
                      <span className="text-[12px] text-[var(--muted-foreground)] font-mono">
                        Rule Preset {activeMode.num} of 08
                      </span>
                    </div>
                    <span className="text-[13px] font-semibold text-[var(--primary)] font-mono">
                      /room/create
                    </span>
                  </div>

                  {/* Mode Rules description */}
                  <p className="text-[13px] text-[var(--muted-foreground)] leading-relaxed bg-[var(--surface-2)] p-3 rounded-[var(--radius-control)] border border-[var(--border)]">
                    {activeMode.rules}
                  </p>

                  {/* Dynamic Content Per Mode */}
                  <div className="flex-1 flex flex-col justify-center transition-opacity duration-150">
                    {activeMode.key === 'CLASSIC' && (
                      <div className="space-y-2.5">
                        <span className="text-[12px] font-semibold text-[var(--foreground)] uppercase font-mono block">
                          Four Choices Preview
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[13px]">
                          <div className="p-2.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted-foreground)]">
                            A. Echoes in Rain
                          </div>
                          <div className="p-2.5 rounded-[var(--radius-control)] bg-emerald-500/15 border border-emerald-500/40 font-semibold text-[var(--foreground)]">
                            B. Neon Midnight
                          </div>
                          <div className="p-2.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted-foreground)]">
                            C. Solar Flare
                          </div>
                          <div className="p-2.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--muted-foreground)]">
                            D. Starlight Ave
                          </div>
                        </div>
                      </div>
                    )}

                    {activeMode.key === 'SURVIVAL' && (
                      <div className="space-y-3 p-3 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                            <Heart size={16} weight="fill" className="text-rose-500" />
                            Lives Remaining
                          </span>
                          <span className="font-mono font-bold text-rose-500 text-[14px]">1 Life Only</span>
                        </div>
                        <p className="text-[12px] text-[var(--muted-foreground)] leading-relaxed">
                          Zero margin for error. The first incorrect or missed answer immediately removes you from the match leaderboard.
                        </p>
                      </div>
                    )}

                    {activeMode.key === 'HARDCORE' && (
                      <div className="space-y-3 p-3 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)]">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                            <Timer size={16} weight="bold" className="text-amber-500" />
                            Blitz Timer
                          </span>
                          <span className="font-mono font-bold text-amber-500 text-[14px]">10s Countdown</span>
                        </div>
                        <div className="w-full bg-[var(--surface-3)] h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-2/3" />
                        </div>
                        <span className="text-[12px] font-mono text-[var(--primary)] font-semibold block">
                          1.5x points multiplier active
                        </span>
                      </div>
                    )}

                    {activeMode.key === 'LYRICS' && (
                      <div className="space-y-2.5 p-3 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)]">
                        <span className="text-[12px] font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                          <Microphone size={15} weight="bold" className="text-[var(--primary)]" />
                          Complete the Vocal Line
                        </span>
                        <div className="text-[13px] font-mono text-[var(--foreground)] p-2.5 rounded bg-[var(--surface-1)] border border-[var(--border)] leading-relaxed">
                          &ldquo;We were running through the night, chasing the ______&rdquo;
                        </div>
                        <span className="text-[12px] text-[var(--muted-foreground)]">4 lyrical endings to choose from</span>
                      </div>
                    )}

                    {activeMode.key === 'DECADE' && (
                      <div className="space-y-2.5">
                        <span className="text-[12px] font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                          <Calendar size={15} weight="bold" className="text-[var(--primary)]" />
                          Era Selection
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-[12px] font-mono text-center">
                          {['1970s', '1980s', '1990s', '2000s', '2010s', '2020s'].map((era, i) => (
                            <div
                              key={era}
                              className={cn(
                                'p-2 rounded-[var(--radius-control)] border text-[12px] font-semibold',
                                i === 1
                                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                                  : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)]'
                              )}
                            >
                              {era}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeMode.key === 'ARTIST' && (
                      <div className="space-y-2.5 p-3 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)]">
                        <span className="text-[12px] font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                          <User size={15} weight="bold" className="text-[var(--primary)]" />
                          Target: Vocalist or Producer
                        </span>
                        <p className="text-[13px] text-[var(--foreground)] leading-relaxed">
                          Identify the creator behind the master track rather than the song name.
                        </p>
                        <div className="flex gap-2 text-[12px] font-mono text-[var(--muted-foreground)]">
                          <span className="p-1 px-2 rounded bg-[var(--surface-1)] border border-[var(--border)]">Band</span>
                          <span className="p-1 px-2 rounded bg-[var(--surface-1)] border border-[var(--border)]">Solo Vocalist</span>
                          <span className="p-1 px-2 rounded bg-[var(--surface-1)] border border-[var(--border)]">Producer</span>
                        </div>
                      </div>
                    )}

                    {activeMode.key === 'ALBUM' && (
                      <div className="space-y-2.5">
                        <span className="text-[12px] font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                          <Disc size={15} weight="bold" className="text-[var(--primary)]" />
                          Album LP Grid
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {['Endless Summer (2016)', 'Monsters (2020)', 'Nocturnal (2017)', 'Heroes (2022)'].map((alb, i) => (
                            <div
                              key={alb}
                              className={cn(
                                'p-2.5 rounded-[var(--radius-control)] border text-[12px]',
                                i === 0
                                  ? 'bg-[var(--surface-3)] border-[var(--primary)] font-semibold text-[var(--foreground)]'
                                  : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)]'
                              )}
                            >
                              {alb}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeMode.key === 'GENRE' && (
                      <div className="space-y-2.5">
                        <span className="text-[12px] font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                          <MusicNotes size={15} weight="bold" className="text-[var(--primary)]" />
                          Soundscape Filter
                        </span>
                        <div className="flex flex-wrap gap-2 text-[12px]">
                          {['Synthwave', 'Indie Rock', 'Pop Hits', 'Hip-Hop', 'Electronic', 'Jazz Fusion'].map((g, i) => (
                            <span
                              key={g}
                              className={cn(
                                'px-2.5 py-1 rounded-[var(--radius-control)] border font-medium',
                                i === 0
                                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                                  : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--muted-foreground)]'
                              )}
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Bar: Clean Spec Readout */}
                <div className="p-4 bg-[var(--surface-2)] border-t border-[var(--border)] flex items-center justify-between text-[12px]">
                  <span className="text-[var(--muted-foreground)] font-mono">10 rounds per match</span>
                  <span className="text-[var(--foreground)] font-semibold font-mono">Up to 1,000 pts / track</span>
                </div>
              </Window>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
