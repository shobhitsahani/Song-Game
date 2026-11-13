'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Play, Check, Crown, Lightning } from '@phosphor-icons/react';

export function HowRoundWorks() {
  return (
    <section className="relative py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section heading: left-aligned, h2 clamp(28px, 3vw, 40px), letter-spacing -0.02em, body font */}
      <div className="mb-10 text-left">
        <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.02em] text-[var(--foreground)]">
          How a round works
        </h2>
        <p className="text-base sm:text-lg text-[var(--muted-foreground)] mt-2 max-w-xl">
          Three steps. Zero waiting. Every round is designed for fast instincts and live competition.
        </p>
      </div>

      {/* Horizontal strip of three real UI fragments */}
      <div
        tabIndex={0}
        role="region"
        aria-label="How a round works steps"
        className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide focus:outline-none"
      >
        {/* Step 1: Hear the clip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 snap-start flex flex-col justify-between card-surface p-6"
        >
          {/* Real UI fragment: Clip playing with waveform + tonearm */}
          <div className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-4 mb-6 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)] mb-3">
              <span className="flex items-center gap-1.5 text-[var(--primary)] font-semibold">
                <Play size={13} weight="fill" /> Playing snippet
              </span>
              <span>0:03 / 0:15</span>
            </div>

            {/* Visual audio waveform */}
            <div className="flex items-center justify-between gap-1 h-12 px-2 bg-[var(--surface-2)] rounded-lg">
              {[25, 45, 80, 100, 60, 90, 70, 40, 85, 95, 50, 30, 65, 80, 45].map((height, idx) => (
                <div
                  key={idx}
                  className="w-1.5 rounded-full bg-[var(--primary)] transition-all duration-300"
                  style={{ height: `${height}%`, opacity: idx < 6 ? 1 : 0.4 }}
                />
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>Vinyl needle dropped</span>
              <span className="font-mono text-emerald-400">Audio Sync OK</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              Hear the clip
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
              A 15-second song snippet streams instantly to everyone in the room at once.
            </p>
          </div>
        </motion.div>

        {/* Step 2: Lock in your answer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 snap-start flex flex-col justify-between card-surface p-6"
        >
          {/* Real UI fragment: Answer buttons */}
          <div className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-4 mb-6 shadow-inner space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
              <span className="font-mono font-bold">1</span>
              <span className="truncate mx-2 font-medium">Midnight Echoes</span>
              <span className="text-xs uppercase font-mono">Option</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 font-semibold shadow-sm">
              <span className="font-mono font-bold text-emerald-400">2</span>
              <span className="truncate mx-2">Neon Midnight</span>
              <Check size={16} weight="bold" className="text-emerald-400 shrink-0" />
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-[var(--muted-foreground)]">
              <span className="text-amber-400 flex items-center gap-1 font-mono font-semibold">
                <Lightning size={12} weight="fill" /> Speed: 1.8s
              </span>
              <span className="font-mono text-emerald-400 font-bold">+1,000 pts</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              Lock in your answer
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
              Tap fast. Answers lock immediately with zero animation delay so every millisecond counts.
            </p>
          </div>
        </motion.div>

        {/* Step 3: Beat the room */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 snap-start flex flex-col justify-between card-surface p-6"
        >
          {/* Real UI fragment: Moving Leaderboard rows */}
          <div className="rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-4 mb-6 shadow-inner space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs">
              <div className="flex items-center gap-2">
                <Crown size={15} weight="fill" className="text-amber-400 shrink-0" />
                <span className="font-semibold text-[var(--foreground)]">You</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-1 rounded">
                  ▲ 1
                </span>
              </div>
              <span className="font-mono font-bold text-[var(--foreground)] tabular-nums">4,250 pts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-1)] text-xs text-[var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold w-4 text-center">2</span>
                <span>Jordan</span>
              </div>
              <span className="font-mono tabular-nums">3,700 pts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-1)] text-xs text-[var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold w-4 text-center">3</span>
                <span>Sam</span>
              </div>
              <span className="font-mono tabular-nums">3,100 pts</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">
              Beat the room
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1.5 leading-relaxed">
              Scores calculate on exact response time. The fastest correct ears climb to the top of the room.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
