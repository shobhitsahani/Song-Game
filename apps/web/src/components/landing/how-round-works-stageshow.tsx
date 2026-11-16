'use client';

import React from 'react';
import {
  Stage,
  Count,
  Roll,
  Avatar,
  type Act,
} from '../stageshow/kit';
import { SpeakerHigh, Check, Timer } from '@phosphor-icons/react';

/* =========================================================================
   Tile 1: Hear the clip (Clip player with audio progress and vinyl disc)
   ========================================================================= */

interface Tile1State {
  progress: number;
  timeSec: number;
  playing: boolean;
}

const tile1Initial: Tile1State = { progress: 30, timeSec: 4, playing: false };
const tile1Poster: Tile1State = { progress: 66, timeSec: 10, playing: true };

async function scriptTile1(a: Act<Tile1State>) {
  await a.wait(300);
  await a.set({ playing: true });
  await a.set({ progress: 45, timeSec: 7 });
  await a.wait(500);
  await a.set({ progress: 66, timeSec: 10 });
  await a.wait(2200);
}

export function HowRoundWorksTile1() {
  return (
    <div className="w-full h-full rounded-[var(--radius-card)] overflow-hidden bg-[var(--surface-1)] border border-[var(--border)] p-4" aria-hidden="true">
      <Stage<Tile1State>
        width={360}
        height={190}
        compact={{ below: 360, width: 310, height: 190 }}
        initial={tile1Initial}
        poster={tile1Poster}
        script={scriptTile1}
        play="once"
        className="look-songgame"
      >
        {(s) => (
          <div className="w-full h-full flex flex-col justify-between" data-crop="true">
            <div className="flex items-center justify-between text-[13px] pb-2 border-b border-[var(--border)]">
              <span className="flex items-center gap-2 text-[var(--foreground)] font-semibold">
                <SpeakerHigh size={16} className="text-[var(--primary)]" weight="fill" />
                <span>Playing Clip</span>
              </span>
              <span className="text-[var(--foreground)] font-mono tabular-nums font-semibold">
                0:{s.timeSec < 10 ? `0${s.timeSec}` : s.timeSec} / 0:15
              </span>
            </div>

            {/* Vinyl player & audio bars */}
            <div className="flex items-center gap-4 py-2">
              <div
                className="w-16 h-16 rounded-full border border-black/10 dark:border-white/10 shrink-0 flex items-center justify-center relative shadow-sm"
                style={{
                  background:
                    'radial-gradient(circle, #2a2a2e 0%, #111113 45%, #2a2a2e 70%, #0d0d0f 100%)',
                  transform: s.playing ? 'rotate(180deg)' : 'none',
                  transition: 'transform 1.6s ease-out',
                }}
              >
                <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              {/* Dynamic waveform bars */}
              <div className="flex-1 flex items-center justify-between gap-1.5 h-12 px-3 bg-[var(--surface-2)] rounded-[var(--radius-control)] border border-[var(--border)]">
                {[30, 60, 90, 100, 70, 85, 45, 95, 75, 40, 80, 55, 35].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-[var(--primary)] transition-all duration-300"
                    style={{
                      height: `${h}%`,
                      opacity: (i / 13) * 100 <= s.progress ? 0.9 : 0.25,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[12px] pt-2 border-t border-[var(--border)] text-[var(--muted-foreground)]">
              <span className="font-medium text-[var(--foreground)]">33 RPM · Mystery track</span>
              <span className="font-mono tabular-nums">15s countdown</span>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}

/* =========================================================================
   Tile 2: Lock in your answer (All four choices A-D, B pressed, speed readout)
   ========================================================================= */

interface Tile2State {
  selected: boolean;
  scoreAwarded: number;
}

const tile2Initial: Tile2State = { selected: false, scoreAwarded: 0 };
const tile2Poster: Tile2State = { selected: true, scoreAwarded: 1000 };

async function scriptTile2(a: Act<Tile2State>) {
  await a.wait(400);
  await a.set({ selected: true, scoreAwarded: 1000 });
  await a.wait(2200);
}

export function HowRoundWorksTile2() {
  return (
    <div className="w-full h-full rounded-[var(--radius-card)] overflow-hidden bg-[var(--surface-1)] border border-[var(--border)] p-3" aria-hidden="true">
      <Stage<Tile2State>
        width={360}
        height={190}
        compact={{ below: 360, width: 310, height: 190 }}
        initial={tile2Initial}
        poster={tile2Poster}
        script={scriptTile2}
        play="once"
        className="look-songgame"
      >
        {(s) => (
          <div className="w-full h-full flex flex-col justify-between" data-crop="true">
            {/* Options A-D Stack (no dead gaps) */}
            <div className="flex flex-col gap-1.5">
              {/* Option A */}
              <div className={`flex items-center justify-between px-2.5 py-1 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)] text-[12px] transition-opacity ${s.selected ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-[4px] bg-[var(--surface-3)] text-[var(--muted-foreground)] font-bold text-[11px] flex items-center justify-center font-mono">
                    A
                  </span>
                  <span className="text-[var(--muted-foreground)]">Echoes in the Rain</span>
                </div>
              </div>

              {/* Option B: The focal locked answer */}
              <div
                className={`flex items-center justify-between px-2.5 py-1 rounded-[var(--radius-control)] border text-[12px] transition-all duration-200 ${
                  s.selected
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-[var(--foreground)]'
                    : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-[4px] font-bold text-[11px] flex items-center justify-center font-mono ${
                      s.selected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[var(--surface-3)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    B
                  </span>
                  <span className="font-semibold">Neon Midnight</span>
                </div>
                {s.selected && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Check size={13} weight="bold" /> +1,000 pts
                  </span>
                )}
              </div>

              {/* Option C */}
              <div className={`flex items-center justify-between px-2.5 py-1 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)] text-[12px] transition-opacity ${s.selected ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-[4px] bg-[var(--surface-3)] text-[var(--muted-foreground)] font-bold text-[11px] flex items-center justify-center font-mono">
                    C
                  </span>
                  <span className="text-[var(--muted-foreground)]">Solar Flare</span>
                </div>
              </div>

              {/* Option D */}
              <div className={`flex items-center justify-between px-2.5 py-1 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)] text-[12px] transition-opacity ${s.selected ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-[4px] bg-[var(--surface-3)] text-[var(--muted-foreground)] font-bold text-[11px] flex items-center justify-center font-mono">
                    D
                  </span>
                  <span className="text-[var(--muted-foreground)]">Starlight Avenue</span>
                </div>
              </div>
            </div>

            {/* Response time bar */}
            <div className="flex items-center justify-between text-[12px] pt-1.5 border-t border-[var(--border)] text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1.5 font-medium">
                <Timer size={14} weight="bold" /> Response time
              </span>
              <span className="font-mono font-semibold text-[var(--foreground)] tabular-nums">
                1.8 seconds
              </span>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}

/* =========================================================================
   Tile 3: Beat the room (Ranked leaderboard rows reordering & score roll)
   ========================================================================= */

interface Tile3State {
  climbed: boolean;
  score: number;
}

const tile3Initial: Tile3State = { climbed: false, score: 3250 };
const tile3Poster: Tile3State = { climbed: true, score: 4250 };

async function scriptTile3(a: Act<Tile3State>) {
  await a.wait(500);
  await a.set({ climbed: true, score: 4250 });
  await a.wait(2200);
}

export function HowRoundWorksTile3() {
  return (
    <div className="w-full h-full rounded-[var(--radius-card)] overflow-hidden bg-[var(--surface-1)] border border-[var(--border)] p-3" aria-hidden="true">
      <Stage<Tile3State>
        width={360}
        height={190}
        compact={{ below: 360, width: 310, height: 190 }}
        initial={tile3Initial}
        poster={tile3Poster}
        script={scriptTile3}
        play="once"
        className="look-songgame"
      >
        {(s) => (
          <div className="w-full h-full flex flex-col justify-between" data-crop="true">
            <div className="flex items-center justify-between text-[13px] pb-1.5 border-b border-[var(--border)]">
              <span className="font-semibold text-[var(--foreground)]">Room Standings</span>
              <span className="text-[12px] font-mono text-[var(--muted-foreground)]">Round 1</span>
            </div>

            <div className="flex flex-col gap-1.5 py-1">
              {/* Row 1: You */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-control)] bg-blue-500/10 border border-blue-500/25 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[12px] text-[var(--primary)] w-4 tabular-nums">
                    #1
                  </span>
                  <Avatar name="YOU" size={22} tone="accent" />
                  <span className="font-bold text-[var(--foreground)]">You</span>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Roll>{s.climbed ? '▲ 1' : '—'}</Roll>
                  </span>
                </div>
                <span className="font-mono font-bold text-[var(--foreground)] tabular-nums">
                  <Count value={s.score} format={(n) => `${n.toLocaleString()} pts`} />
                </span>
              </div>

              {/* Row 2: Jordan */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] text-[12px] text-[var(--muted-foreground)] border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[12px] w-4 tabular-nums">#2</span>
                  <Avatar name="JD" size={22} tone="person" />
                  <span className="text-[var(--foreground)] font-medium">Jordan</span>
                </div>
                <span className="font-mono tabular-nums">3,700 pts</span>
              </div>

              {/* Row 3: Sam */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] text-[12px] text-[var(--muted-foreground)] border border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[12px] w-4 tabular-nums">#3</span>
                  <Avatar name="SM" size={22} tone="person" />
                  <span className="text-[var(--foreground)] font-medium">Sam</span>
                </div>
                <span className="font-mono tabular-nums">3,100 pts</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[12px] pt-1.5 border-t border-[var(--border)] text-[var(--muted-foreground)]">
              <span>Next clip in 5s</span>
              <span className="font-mono tabular-nums">+1,000 pts awarded</span>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}
