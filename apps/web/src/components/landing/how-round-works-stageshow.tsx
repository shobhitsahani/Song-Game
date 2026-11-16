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

const tile1Initial: Tile1State = { progress: 20, timeSec: 3, playing: false };
const tile1Poster: Tile1State = { progress: 65, timeSec: 10, playing: true };

async function scriptTile1(a: Act<Tile1State>) {
  await a.wait(300);
  await a.set({ playing: true });
  await a.set({ progress: 40, timeSec: 6 });
  await a.wait(500);
  await a.set({ progress: 65, timeSec: 10 });
  await a.wait(2200);
}

export function HowRoundWorksTile1() {
  return (
    <div className="w-full bg-[var(--surface-1)] p-4" aria-hidden="true">
      <Stage<Tile1State>
        width={320}
        height={140}
        compact={{ below: 320, width: 280, height: 140 }}
        initial={tile1Initial}
        poster={tile1Poster}
        script={scriptTile1}
        play="once"
        className="look-songgame"
      >
        {(s) => (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[var(--foreground)] font-semibold">
                <SpeakerHigh size={14} className="text-[var(--primary)]" weight="fill" />
                <span>Playing Clip</span>
              </span>
              <span className="text-[var(--muted-foreground)] font-mono tabular-nums">
                0:{s.timeSec < 10 ? `0${s.timeSec}` : s.timeSec} / 0:15
              </span>
            </div>

            {/* Vinyl player & audio bars */}
            <div className="flex items-center gap-3 py-1.5">
              <div
                className="w-12 h-12 rounded-full border border-black/10 dark:border-white/10 shrink-0 flex items-center justify-center relative shadow-sm"
                style={{
                  background:
                    'radial-gradient(circle, #2a2a2e 0%, #111113 45%, #2a2a2e 70%, #0d0d0f 100%)',
                  transform: s.playing ? 'rotate(180deg)' : 'none',
                  transition: 'transform 1.6s ease-out',
                }}
              >
                <div className="w-4 h-4 rounded-full bg-[var(--primary)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              {/* Dynamic waveform bars */}
              <div className="flex-1 flex items-center justify-between gap-1 h-10 px-2.5 bg-[var(--surface-2)] rounded-[var(--radius-control)] border border-[var(--border)]">
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

            <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
              <span>33 RPM · Mystery track</span>
              <span className="font-mono">15s countdown</span>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}

/* =========================================================================
   Tile 2: Lock in your answer (Answer selection, speed, +1,000 pts chip)
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
    <div className="w-full bg-[var(--surface-1)] p-4" aria-hidden="true">
      <Stage<Tile2State>
        width={320}
        height={140}
        compact={{ below: 320, width: 280, height: 140 }}
        initial={tile2Initial}
        poster={tile2Poster}
        script={scriptTile2}
        play="once"
        className="look-songgame"
      >
        {(s) => (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Option A: Unselected option */}
            <div className="flex items-center justify-between p-2 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-[4px] bg-[var(--surface-3)] text-[var(--muted-foreground)] font-bold text-[10px] flex items-center justify-center font-mono">
                  A
                </span>
                <span className="text-[var(--muted-foreground)]">Echoes in the Rain</span>
              </div>
            </div>

            {/* Option B: The focal locked answer */}
            <div
              className={`flex items-center justify-between p-2 rounded-[var(--radius-control)] border text-xs transition-all duration-200 ${
                s.selected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--foreground)]'
                  : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-[4px] font-bold text-[10px] flex items-center justify-center font-mono ${
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

            {/* Response time */}
            <div className="flex items-center justify-between text-xs pt-0.5 text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1 font-medium">
                <Timer size={13} weight="bold" /> Response time
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
    <div className="w-full bg-[var(--surface-1)] p-4" aria-hidden="true">
      <Stage<Tile3State>
        width={320}
        height={140}
        compact={{ below: 320, width: 280, height: 140 }}
        initial={tile3Initial}
        poster={tile3Poster}
        script={scriptTile3}
        play="once"
        className="look-songgame"
      >
        {(s) => (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Row 1: You */}
            <div className="flex items-center justify-between p-1.5 px-2 rounded-[var(--radius-control)] bg-blue-500/10 border border-blue-500/25 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-[var(--primary)] w-4">
                  #1
                </span>
                <Avatar name="YOU" size={20} tone="accent" />
                <span className="font-bold text-[var(--foreground)]">You</span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Roll>{s.climbed ? '▲ 1' : '—'}</Roll>
                </span>
              </div>
              <span className="font-mono font-bold text-[var(--foreground)] tabular-nums">
                <Count value={s.score} format={(n) => `${n.toLocaleString()} pts`} />
              </span>
            </div>

            {/* Row 2: Jordan */}
            <div className="flex items-center justify-between p-1.5 px-2 rounded-[var(--radius-control)] bg-[var(--surface-2)] text-xs text-[var(--muted-foreground)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs w-4">#2</span>
                <Avatar name="JD" size={20} tone="person" />
                <span className="text-[var(--foreground)] font-medium">Jordan</span>
              </div>
              <span className="font-mono tabular-nums">3,700 pts</span>
            </div>

            {/* Row 3: Sam */}
            <div className="flex items-center justify-between p-1.5 px-2 rounded-[var(--radius-control)] bg-[var(--surface-2)] text-xs text-[var(--muted-foreground)] border border-[var(--border)]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs w-4">#3</span>
                <Avatar name="SM" size={20} tone="person" />
                <span className="text-[var(--foreground)] font-medium">Sam</span>
              </div>
              <span className="font-mono tabular-nums">3,100 pts</span>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}