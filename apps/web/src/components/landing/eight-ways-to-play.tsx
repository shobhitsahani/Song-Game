'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  Heart,
  Timer,
  Disc,
  ArrowRight,
  Lightning,
  Microphone,
  MusicNotes,
} from '@phosphor-icons/react';
import { Avatar, Badge, Bar } from '../stageshow/kit';
import { cn } from '@/lib/utils';

interface ModeTileProps {
  title: string;
  description: string;
  mode: string;
  className?: string;
  children: React.ReactNode;
}

function ModeTile({ title, description, mode, className, children }: ModeTileProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <Link
      ref={cardRef}
      href={`/room/create?mode=${mode}`}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-[20px] p-6',
        'card-surface hover:-translate-y-0.5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        className
      )}
    >
      {/* Cursor-follow spotlight reflection */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--glass-highlight) 0%, transparent 80%)',
        }}
      />

      {/* Mini faux UI visual fitting the mode */}
      <div className="relative z-10 w-full mb-4" aria-hidden="true">
        {children}
      </div>

      {/* Title + Description */}
      <div className="relative z-10 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-sans text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
            {title}
          </h3>
          <ArrowRight
            size={16}
            weight="bold"
            className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all"
          />
        </div>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
}

export function EightWaysToPlay() {
  return (
    <section className="relative py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section heading: left-aligned */}
      <div className="mb-10 text-left">
        <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.02em] text-[var(--foreground)]">
          Eight ways to play
        </h2>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] mt-2 max-w-xl">
          From party casual to sudden-death elimination. Choose your rules before opening the room.
        </p>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Classic - Large 2x2 tile */}
        <ModeTile
          title="Classic"
          description="Guess the song title from 15-second audio snippets across all playlists."
          mode="CLASSIC"
          className="md:col-span-2 lg:col-span-2 lg:row-span-2 min-h-[300px] sm:min-h-[360px] justify-between"
        >
          <div className="h-44 sm:h-52 w-full rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
            <div className="flex items-center justify-between">
              <Badge tone="accent" dot>15s Audio Clip</Badge>
              <span className="text-[11px] font-mono font-semibold text-[var(--muted-foreground)]">
                4 Choices
              </span>
            </div>

            <div className="flex items-center justify-center my-auto">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-black via-zinc-900 to-black border-2 border-white/10 shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <div className="w-20 h-20 rounded-full border border-zinc-700/50 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-md">
                      <Disc size={16} weight="fill" className="text-[var(--primary-foreground)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                <span className="font-mono font-bold text-[10px]">A</span>
                <Bar w={64} h={5} tone={2} />
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-xs text-[var(--foreground)] font-semibold">
                <span className="font-mono font-bold text-[10px] text-[var(--primary)]">B</span>
                <span className="truncate text-[11px]">Neon Midnight</span>
              </div>
            </div>
          </div>
        </ModeTile>

        {/* 2. Survival - Wide tile */}
        <ModeTile
          title="Survival"
          description="Sudden-death elimination: miss one question and you are knocked out of the room."
          mode="SURVIVAL"
          className="md:col-span-2 lg:col-span-2 min-h-[170px]"
        >
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono text-[var(--muted-foreground)] mr-1">Lives:</span>
              <Heart size={20} weight="fill" className="text-rose-500 group-hover:scale-110 transition-transform" />
              <Heart size={20} weight="fill" className="text-rose-500 group-hover:scale-110 transition-transform delay-75" />
              <Heart size={20} weight="fill" className="text-rose-500/30" />
            </div>
            <Badge tone="danger" dot>Knockout active</Badge>
          </div>
        </ModeTile>

        {/* 3. Hardcore - Standard tile */}
        <ModeTile
          title="Hardcore"
          description="Compressed 10-second timer with zero room for second guesses."
          mode="HARDCORE"
          className="min-h-[170px]"
        >
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <Timer size={22} weight="duotone" className="text-[var(--destructive)]" />
              <span className="text-sm font-mono font-bold text-[var(--destructive)]">10s max</span>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 border-t-[var(--destructive)] flex items-center justify-center text-xs font-mono font-bold text-[var(--destructive)] group-hover:rotate-45 transition-transform">
              3s
            </div>
          </div>
        </ModeTile>

        {/* 4. Lyrics - Standard tile */}
        <ModeTile
          title="Lyrics"
          description="Identify the track from missing lyrics and vocal phrases."
          mode="LYRICS"
          className="min-h-[170px]"
        >
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-3.5 flex items-center shadow-inner">
            <p className="text-xs font-mono text-[var(--muted-foreground)] truncate flex items-center gap-1.5">
              <Microphone size={14} className="text-[var(--primary)] shrink-0" />
              <span>&quot;City streets with</span>
              <span className="text-[var(--primary)] font-bold bg-[var(--surface-2)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                neon
              </span>
              <span>glow&quot;</span>
            </p>
          </div>
        </ModeTile>

        {/* 5. Decade - Standard tile */}
        <ModeTile
          title="Decade"
          description="Filter clips strictly to your era, from 70s rock to modern 2020s hits."
          mode="DECADE"
          className="min-h-[170px]"
        >
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-3 flex items-center justify-between overflow-hidden gap-1 text-xs font-mono shadow-inner">
            <span className="text-[var(--muted-foreground)]">70s</span>
            <span className="text-[var(--muted-foreground)]">80s</span>
            <Badge tone="accent">90s</Badge>
            <span className="text-[var(--muted-foreground)]">00s</span>
            <span className="text-[var(--muted-foreground)]">20s</span>
          </div>
        </ModeTile>

        {/* 6. Artist - Standard tile */}
        <ModeTile
          title="Artist"
          description="Name the vocalist, band, or producer behind the track instead of the song title."
          mode="ARTIST"
          className="min-h-[170px]"
        >
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center -space-x-1.5">
              <Avatar name="VW" size={26} tone="person" />
              <Avatar name="NS" size={26} tone="person" />
              <Avatar name="SD" size={26} tone="person" />
            </div>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">Who sang it?</span>
          </div>
        </ModeTile>

        {/* 7. Album - Standard tile */}
        <ModeTile
          title="Album"
          description="Pick the exact studio album or LP release where the track first debuted."
          mode="ALBUM"
          className="min-h-[170px]"
        >
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-2 grid grid-cols-4 gap-1.5 shadow-inner">
            <div className="rounded bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
              <MusicNotes size={13} className="text-[var(--muted-foreground)] opacity-50" />
            </div>
            <div className="rounded bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Disc size={15} className="text-[var(--primary)]" />
            </div>
            <div className="rounded bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
              <Bar w={12} h={4} tone={1} />
            </div>
            <div className="rounded bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
              <Bar w={12} h={4} tone={1} />
            </div>
          </div>
        </ModeTile>

        {/* 8. Genre - Standard tile */}
        <ModeTile
          title="Genre"
          description="Target specific soundscapes: Pop Hits, Classic Rock, Hip-Hop, Indie, or Electronic."
          mode="GENRE"
          className="min-h-[170px]"
        >
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-3 flex items-center gap-1.5 overflow-hidden text-xs font-mono shadow-inner">
            <span className="px-2 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] text-[11px]">
              Rock
            </span>
            <Badge tone="accent">Pop</Badge>
            <span className="px-2 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] text-[11px]">
              R&amp;B
            </span>
          </div>
        </ModeTile>
      </div>
    </section>
  );
}
