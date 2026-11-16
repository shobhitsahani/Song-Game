'use client';

import React from 'react';
import {
  Stage,
  Bar,
  Count,
  Roll,
  type Act,
} from '../stageshow/kit';
import { Play, Check, Crown, Lightning } from '@phosphor-icons/react';

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
  await a.wait(200);
  await a.set({ playing: true });
  await a.set({ progress: 40, timeSec: 6 });
  await a.wait(400);
  await a.set({ progress: 65, timeSec: 10 });
  await a.wait(1800);
}

export function HowRoundWorksTile1() {
  return (
    <div className="w-full rounded-xl overflow-hidden mb-6 bg-[var(--surface-1)] border border-[var(--border)] p-3.5 shadow-inner" aria-hidden="true">
      <Stage<Tile1State>
        width={320}
        height={136}
        compact={{ below: 320, width: 280, height: 136 }}
        initial={tile1Initial}
        poster={tile1Poster}
        script={scriptTile1}
        play="once"
        className="look-songgame"
      >
        {(s) => (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[var(--primary)] font-semibold">
                <Play size={13} weight="fill" /> Playing snippet
              </span>
              <span className="text-[var(--muted-foreground)]">0:{s.timeSec < 10 ? `0${s.timeSec}` : s.timeSec} / 0:15</span>
            </div>

            {/* Vinyl player & audio bars */}
            <div className="flex items-center gap-3 py-1">
              <div
                className="w-12 h-12 rounded-full border border-white/10 shrink-0 flex items-center justify-center relative shadow-md"
                style={{
                  background: 'radial-gradient(circle, #2a2a2e 0%, #111113 45%, #2a2a2e 70%, #0d0d0f 100%)',
                  transform: s.playing ? 'rotate(90deg)' : 'none',
                  transition: 'transform 1.2s ease-out',
                }}
              >
                <div className="w-4 h-4 rounded-full bg-[var(--primary)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              {/* Dynamic waveform bars */}
              <div className="flex-1 flex items-center justify-between gap-1 h-9 px-2 bg-[var(--surface-2)] rounded-lg">
                {[30, 60, 90, 100, 70, 85, 45, 95, 75, 40, 80, 55, 35].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-[var(--primary)] transition-all duration-300"
                    style={{
                      height: `${h}%`,
                      opacity: (i / 13) * 100 <= s.progress ? 1 : 0.25,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
              <span>Vinyl needle dropped</span>
              <span className="font-mono text-emerald-400 font-semibold">Audio Sync OK</span>
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
  await a.wait(350);
  await a.set({ selected: true, scoreAwarded: 1000 });
  await a.wait(2000);
}

export function HowRoundWorksTile2() {
  return (
    <div className="w-full rounded-xl overflow-hidden mb-6 bg-[var(--surface-1)] border border-[var(--border)] p-3.5 shadow-inner" aria-hidden="true">
      <Stage<Tile2State>
        width={320}
        height={136}
        compact={{ below: 320, width: 280, height: 136 }}
        initial={tile2Initial}
        poster={tile2Poster}
        script={scriptTile2}
        play="once"
        className="look-songgame"
      >
        {(s) => (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Option 1: Quiet placeholder bar */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs">
              <span className="font-mono font-bold text-[var(--muted-foreground)]">A</span>
              <Bar w={110} h={6} tone={2} />
              <Bar w={36} h={5} tone={1} />
            </div>

            {/* Option 2: The focal locked answer */}
            <div
              className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all duration-300 ${
                s.selected
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm'
                  : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">B</span>
                <span className="font-semibold">Neon Midnight</span>
              </div>
              {s.selected ? (
                <Check size={16} weight="bold" className="text-emerald-400 shrink-0" />
              ) : (
                <Bar w={24} h={5} tone={1} />
              )}
            </div>

            {/* Points & Speed chips */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-amber-400 flex items-center gap-1 font-mono font-semibold">
                <Lightning size={12} weight="fill" /> Speed: 1.8s
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {s.selected ? '+1,000 pts' : '+0 pts'}
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
  await a.wait(450);
  await a.set({ climbed: true, score: 4250 });
  await a.wait(2000);
}

export function HowRoundWorksTile3() {
  return (
    <div className="w-full rounded-xl overflow-hidden mb-6 bg-[var(--surface-1)] border border-[var(--border)] p-3.5 shadow-inner" aria-hidden="true">
      <Stage<Tile3State>
        width={320}
        height={136}
        compact={{ below: 320, width: 280, height: 136 }}
        initial={tile3Initial}
        poster={tile3Poster}
        script={scriptTile3}
        play="once"
        className="look-songgame"
      >
        {(s) => (
          <div className="w-full h-full flex flex-col justify-between">
            {/* Row 1: You (climbed to #1 with crown) */}
            <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs">
              <div className="flex items-center gap-1.5">
                <Crown size={14} weight="fill" className="text-amber-400 shrink-0" />
                <span className="font-bold text-[var(--foreground)]">You</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded font-semibold">
                  <Roll>{s.climbed ? '▲ 1' : '—'}</Roll>
                </span>
              </div>
              <span className="font-mono font-bold text-[var(--foreground)] tabular-nums">
                <Count value={s.score} format={(n) => `${n.toLocaleString()} pts`} />
              </span>
            </div>

            {/* Row 2: Jordan */}
            <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-[var(--surface-1)] text-xs text-[var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold w-3 text-center">2</span>
                <span>Jordan</span>
              </div>
              <span className="font-mono tabular-nums">3,700 pts</span>
            </div>

            {/* Row 3: Sam */}
            <div className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-[var(--surface-1)] text-xs text-[var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold w-3 text-center">3</span>
                <span>Sam</span>
              </div>
              <span className="font-mono tabular-nums">3,100 pts</span>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}
