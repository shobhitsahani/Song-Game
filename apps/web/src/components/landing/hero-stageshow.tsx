'use client';

import React from 'react';
import {
  Stage,
  Window,
  Avatar,
  Count,
  type Act,
} from '../stageshow/kit';
import { Timer } from '@phosphor-icons/react';
import { SITE_HOST } from '@/lib/site';
import './hero-stageshow.css';

interface HeroState {
  spinning: boolean;
  jordanLocked: boolean;
  locked: boolean;
  resolved: boolean;
  selectedKey: 'A' | 'B' | 'C' | 'D' | null;
  score: number;
  rank: number;
  timer: number;
}

const initial: HeroState = {
  spinning: true,
  jordanLocked: false,
  locked: false,
  resolved: false,
  selectedKey: null,
  score: 3250,
  rank: 2,
  timer: 15,
};

const poster: HeroState = {
  spinning: false,
  jordanLocked: true,
  locked: true,
  resolved: true,
  selectedKey: 'B',
  score: 4250,
  rank: 1,
  timer: 13,
};

const REST = { x: 340, y: 460 };

async function script(a: Act<HeroState>) {
  // Beat 1: Needle drops / vinyl spins. Timer ticks down. Jordan locks in at ~0.8s.
  await a.wait(600);
  await a.set({ timer: 14, jordanLocked: true });
  await a.wait(400);

  // Beat 2: Cursor targets Option B ("Neon Midnight")
  await a.move('hero-opt-b');
  await a.wait(250);

  // Beat 3: Cursor clicks & locks in B at ~1.8s
  await a.click();
  await a.set({
    locked: true,
    selectedKey: 'B',
    timer: 13,
  });

  // Move cursor away to quiet rest area so it never obscures text
  await a.wait(150);
  await a.move(REST);
  await a.wait(300);

  // Beat 4: Round resolves! Option B turns green (correct answer!), +1,000 pts rolls to You,
  // standings reorder to You #1 with 4,250 pts, song title revealed
  await a.set({
    resolved: true,
    score: 4250,
    rank: 1,
    spinning: false,
  });

  // Beat 5: Hold payoff frame
  await a.wait(3200);

  // Seam reset for clean loop
  await a.set(initial);
  await a.wait(600);
}

export function HeroStageshow() {
  return (
    <div className="hero-stageshow-container" aria-hidden="true" role="presentation">
      <Stage<HeroState>
        width={358}
        height={480}
        initial={initial}
        poster={poster}
        script={script}
        play="loop"
        cursor={{ at: REST, style: 'arrow', ripple: true, idle: 300 }}
        className="look-songgame"
      >
        {(s) => (
          <Window
            tabs={['SongGame — Room VR426D']}
            nav
            url={
              <span className="hero-window-url-content">
                <svg
                  width="8"
                  height="9"
                  viewBox="0 0 7 8"
                  fill="currentColor"
                  className="opacity-70 shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M1.5 3.3V2.4a2 2 0 0 1 4 0v.9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.1"
                  />
                  <rect x="0" y="3.3" width="7" height="4.7" rx="1.2" />
                </svg>
                <span className="truncate">{`${SITE_HOST}/room/VR426D`}</span>
              </span>
            }
            urlShape="rounded"
            chrome="native"
            lights="color"
            className="hero-window"
          >
            {/* Compact Window View (358px) */}
            <div className="hero-compact-layout">
              {/* Top bar */}
              <div className="hero-room-topbar">
                <span className="text-[13px] font-mono font-bold text-[var(--foreground)]">VR426D</span>
                <span className="text-[13px] font-medium text-[var(--foreground)]">
                  Round 1/10
                </span>
                <div className="flex items-center gap-1.5 ml-auto text-[13px] text-[var(--foreground)]">
                  <Timer size={14} weight="bold" />
                  <span className="font-mono tabular-nums font-semibold">{s.timer}s</span>
                </div>
              </div>

              {/* Compact Player Deck */}
              <div className="hero-player-deck" data-crop="true">
                <div className="hero-vinyl-groove">
                  <div className="hero-vinyl-disc" data-spinning={s.spinning}>
                    <div className="hero-vinyl-label">
                      <div className="hero-vinyl-spindle" />
                    </div>
                  </div>
                </div>
                <div className="hero-mystery-info">
                  <span className="text-[14px] font-bold text-[var(--foreground)]">
                    Playing Clip
                  </span>
                  <span className="text-[12px] text-[var(--muted-foreground)]">
                    {s.resolved ? 'Neon Midnight · The Midnight' : 'Mystery Track · 33 RPM'}
                  </span>
                </div>
              </div>

              {/* 2x2 Answer Grid */}
              <div className="hero-answers-grid">
                <div className="hero-answer-card" data-target="hero-opt-a">
                  <span className="hero-answer-key">A</span>
                  <span className="hero-answer-title">Echoes in Rain</span>
                </div>
                <div
                  className="hero-answer-card"
                  data-target="hero-opt-b"
                  data-selected={s.selectedKey === 'B'}
                  data-correct={s.resolved}
                >
                  <span className="hero-answer-key">B</span>
                  <span className="hero-answer-title">Neon Midnight</span>
                </div>
                <div className="hero-answer-card" data-target="hero-opt-c">
                  <span className="hero-answer-key">C</span>
                  <span className="hero-answer-title">Solar Flare</span>
                </div>
                <div className="hero-answer-card" data-target="hero-opt-d">
                  <span className="hero-answer-key">D</span>
                  <span className="hero-answer-title">Starlight Ave</span>
                </div>
              </div>

              {/* Compact Standings Strip */}
              <div className="hero-compact-strip">
                <div className="flex items-center gap-2">
                  <Avatar name="YOU" size={22} tone="accent" />
                  <span className="text-[13px] font-bold text-[var(--foreground)]">
                    {s.rank === 1 ? '#1 You' : '#2 You'}
                  </span>
                  <span className="text-[13px] font-mono font-bold text-[var(--primary)] tabular-nums">
                    <Count value={s.score} format={(n) => n.toLocaleString()} /> pts
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--muted-foreground)]">
                  <span>Jordan 3,700</span>
                </div>
              </div>
            </div>
          </Window>
        )}
      </Stage>
    </div>
  );
}
