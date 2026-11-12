'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  Heart,
  Timer,
  Disc,
  ArrowRight,
} from '@phosphor-icons/react';
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

      {/* Mini-UI visual fitting the mode */}
      <div className="relative z-10 w-full mb-4">{children}</div>

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
          <div className="h-44 sm:h-52 w-full rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] relative overflow-hidden flex items-center justify-center p-4">
            {/* Spinning grooved vinyl disc visual */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-black via-zinc-900 to-black border-4 border-zinc-800 shadow-xl flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border border-zinc-700/60 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-zinc-800 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-md">
                    <Disc size={20} weight="fill" className="text-[var(--primary-foreground)]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-3 left-3 text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
              15s Audio Clip · 4 Choices
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
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--muted-foreground)] mr-1">Lives:</span>
              <Heart size={20} weight="fill" className="text-rose-500 animate-pulse" />
              <Heart size={20} weight="fill" className="text-rose-500 animate-pulse" />
              <Heart size={20} weight="fill" className="text-rose-500 animate-pulse" />
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Knockout active
            </span>
          </div>
        </ModeTile>

        {/* 3. Hardcore - Standard tile */}
        <ModeTile
          title="Hardcore"
          description="Compressed 10-second timer with zero room for second guesses."
          mode="HARDCORE"
          className="min-h-[170px]"
        >
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer size={22} weight="duotone" className="text-rose-400" />
              <span className="text-sm font-mono font-bold text-rose-400">10s max</span>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin flex items-center justify-center text-xs font-mono text-rose-400">
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
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-3.5 flex items-center">
            <p className="text-xs font-mono text-[var(--muted-foreground)] truncate">
              &quot;I got the <span className="text-[var(--primary)] font-bold bg-[var(--surface-2)] px-1.5 py-0.5 rounded border border-[var(--glass-border)]">____</span> in the back&quot;
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
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-3 flex items-center justify-between overflow-hidden gap-1 text-xs font-mono">
            <span className="text-[var(--muted-foreground)]">70s</span>
            <span className="text-[var(--muted-foreground)]">80s</span>
            <span className="text-[var(--primary)] font-bold bg-[var(--surface-2)] px-1.5 py-0.5 rounded border border-[var(--border)]">
              90s
            </span>
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
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-4 flex items-center justify-between">
            <div className="flex items-center -space-x-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-[var(--card)] flex items-center justify-center text-xs font-bold text-amber-300">
                A
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-[var(--card)] flex items-center justify-center text-xs font-bold text-indigo-300">
                B
              </div>
              <div className="w-8 h-8 rounded-full bg-pink-500/20 border-2 border-[var(--card)] flex items-center justify-center text-xs font-bold text-pink-300">
                C
              </div>
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
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-2 grid grid-cols-4 gap-1.5">
            <div className="rounded bg-[var(--surface-2)] border border-[var(--border)]" />
            <div className="rounded bg-[var(--primary)]/20 border border-[var(--primary)]/40 flex items-center justify-center">
              <Disc size={14} className="text-[var(--primary)]" />
            </div>
            <div className="rounded bg-[var(--surface-2)] border border-[var(--border)]" />
            <div className="rounded bg-[var(--surface-2)] border border-[var(--border)]" />
          </div>
        </ModeTile>

        {/* 8. Genre - Standard tile */}
        <ModeTile
          title="Genre"
          description="Target specific soundscapes: Pop Hits, Classic Rock, Hip-Hop, Indie, or Electronic."
          mode="GENRE"
          className="min-h-[170px]"
        >
          <div className="h-16 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] px-3 flex items-center gap-1.5 overflow-hidden text-xs font-mono">
            <span className="px-2 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)]">
              Rock
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/30 text-[var(--primary)] font-bold">
              Pop
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)]">
              R&amp;B
            </span>
          </div>
        </ModeTile>
      </div>
    </section>
  );
}
