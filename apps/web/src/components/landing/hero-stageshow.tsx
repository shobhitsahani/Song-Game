'use client';

import React from 'react';
import {
  Stage,
  Window,
  Avatar,
  Count,
  Roll,
  type Act,
} from '../stageshow/kit';
import { Timer, Check, SpeakerHigh } from '@phosphor-icons/react';
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
  await a.wait(400);

  // Beat 4: Round resolves! Option B turns green (correct answer!), +1,000 pts rolls to You,
  // standings reorder to You #1 with 4,250 pts
  await a.set({
    resolved: true,
    score: 4250,
    rank: 1,
    spinning: false,
  });

  // Beat 5: Hold payoff frame
  await a.wait(3200);

  // Seam reset for loop
  await a.set(initial);
  await a.wait(600);
}

const REST = {
  wide: { x: 500, y: 390 },
  compact: { x: 260, y: 410 },
};

export function HeroStageshow() {
  return (
    <div className="hero-stageshow-container" aria-hidden="true" role="presentation">
      <Stage<HeroState>
        width={620}
        height={410}
        compact={{ below: 620, width: 358, height: 440 }}
        initial={initial}
        poster={poster}
        script={script}
        play="loop"
        cursor={{ at: REST, style: 'arrow', ripple: true }}
        className="look-songgame"
      >
        {(s, _rect, layout) => (
          <Window
            tabs={['SongGame']}
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
                <span>https://songgame.app/room/VR426D</span>
              </span>
            }
            urlShape="pill"
            chrome="native"
            lights="color"
            className="hero-window"
          >
            {layout === 'wide' ? (
              /* Wide 2-Column Desktop Room */
              <div className="hero-room-layout">
                {/* Left Column (~65%): Turntable + Mystery Clip + Answers */}
                <div className="hero-room-main">
                  {/* Room sub-bar */}
                  <div className="hero-room-topbar">
                    <div className="flex items-center gap-2">
                      <span className="hero-code-pill font-mono">VR426D</span>
                      <span className="text-xs font-semibold text-[var(--foreground)]">
                        Round 1 of 10
                      </span>
                    </div>
                    <div className="hero-timer-pill">
                      <Timer size={13} weight="bold" />
                      <span className="font-mono tabular-nums">{s.timer}s</span>
                    </div>
                  </div>

                  {/* Vinyl turntable clip player (DO NOT spoil song title) */}
                  <div className="hero-player-deck">
                    <div className="hero-vinyl-groove" data-spinning={s.spinning}>
                      <div className="hero-vinyl-label">
                        <div className="hero-vinyl-spindle" />
                      </div>
                    </div>
                    {/* Tone arm needle */}
                    <div className="hero-tone-arm" data-active={s.spinning} />

                    <div className="hero-mystery-info">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]">
                        <SpeakerHigh size={14} className="text-[var(--primary)]" weight="fill" />
                        <span>Playing Clip</span>
                        <span className="text-[var(--muted-foreground)] font-mono text-[11px]">
                          (0:{15 - s.timer < 10 ? `0${15 - s.timer}` : 15 - s.timer} / 0:15)
                        </span>
                      </div>
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        33 RPM · Mystery Track
                      </span>

                      {/* Equalizer bars */}
                      <div className="hero-eq-bars" data-active={s.spinning}>
                        <span className="hero-eq-bar bar-1" />
                        <span className="hero-eq-bar bar-2" />
                        <span className="hero-eq-bar bar-3" />
                        <span className="hero-eq-bar bar-4" />
                        <span className="hero-eq-bar bar-5" />
                        <span className="hero-eq-bar bar-6" />
                      </div>
                    </div>
                  </div>

                  {/* 2x2 Answer Grid */}
                  <div className="hero-answers-grid">
                    <div className="hero-answer-card" data-target="hero-opt-a">
                      <span className="hero-answer-key">A</span>
                      <span className="hero-answer-title">Echoes in the Rain</span>
                    </div>

                    <div
                      className="hero-answer-card"
                      data-target="hero-opt-b"
                      data-selected={s.selectedKey === 'B'}
                      data-correct={s.resolved}
                    >
                      <span className="hero-answer-key">B</span>
                      <span className="hero-answer-title">Neon Midnight</span>
                      {s.resolved && (
                        <span className="hero-answer-payoff">
                          <Check size={12} weight="bold" /> +1,000 pts
                        </span>
                      )}
                    </div>

                    <div className="hero-answer-card" data-target="hero-opt-c">
                      <span className="hero-answer-key">C</span>
                      <span className="hero-answer-title">Solar Flare</span>
                    </div>

                    <div className="hero-answer-card" data-target="hero-opt-d">
                      <span className="hero-answer-key">D</span>
                      <span className="hero-answer-title">Starlight Avenue</span>
                    </div>
                  </div>
                </div>

                {/* Right Column (~35%): Players Roster Rail */}
                <div className="hero-room-rail">
                  <div className="hero-rail-header">
                    <span>Players in Room</span>
                    <span className="hero-rail-count">4</span>
                  </div>

                  <div className="hero-rail-roster">
                    {/* Rank 1 */}
                    <div
                      className={`hero-roster-row ${s.resolved ? 'hero-row-you' : 'hero-row-other'}`}
                    >
                      <span className="hero-roster-rank font-mono">#1</span>
                      <Avatar
                        name={s.resolved ? 'YOU' : 'JD'}
                        size={22}
                        tone={s.resolved ? 'accent' : 'person'}
                      />
                      <div className="hero-roster-meta">
                        <span className="hero-roster-name">
                          {s.resolved ? 'You' : 'Jordan'}
                        </span>
                        <span className="hero-roster-status text-[var(--success)]">
                          {s.resolved ? 'Locked · 1.8s' : 'Locked · 2.1s'}
                        </span>
                      </div>
                      <span className="hero-roster-score font-mono tabular-nums">
                        {s.resolved ? (
                          <Count value={s.score} format={(n) => n.toLocaleString()} />
                        ) : (
                          '3,700'
                        )}
                      </span>
                    </div>

                    {/* Rank 2 */}
                    <div
                      className={`hero-roster-row ${s.resolved ? 'hero-row-other' : 'hero-row-you'}`}
                    >
                      <span className="hero-roster-rank font-mono">#2</span>
                      <Avatar
                        name={s.resolved ? 'JD' : 'YOU'}
                        size={22}
                        tone={s.resolved ? 'person' : 'accent'}
                      />
                      <div className="hero-roster-meta">
                        <span className="hero-roster-name">
                          {s.resolved ? 'Jordan' : 'You'}
                        </span>
                        <span
                          className={`hero-roster-status ${
                            s.locked ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                          }`}
                        >
                          {s.resolved
                            ? 'Locked · 2.1s'
                            : s.locked
                              ? 'Locked in · 1.8s'
                              : 'Listening...'}
                        </span>
                      </div>
                      <span className="hero-roster-score font-mono tabular-nums">
                        {s.resolved ? (
                          '3,700'
                        ) : (
                          <Count value={s.score} format={(n) => n.toLocaleString()} />
                        )}
                      </span>
                    </div>

                    {/* Rank 3: Sam */}
                    <div className="hero-roster-row">
                      <span className="hero-roster-rank font-mono">#3</span>
                      <Avatar name="SM" size={22} tone="person" />
                      <div className="hero-roster-meta">
                        <span className="hero-roster-name">Sam</span>
                        <span className="hero-roster-status text-[var(--muted-foreground)]">
                          Listening...
                        </span>
                      </div>
                      <span className="hero-roster-score font-mono tabular-nums">3,100</span>
                    </div>

                    {/* Rank 4: Alex */}
                    <div className="hero-roster-row">
                      <span className="hero-roster-rank font-mono">#4</span>
                      <Avatar name="AX" size={22} tone="person" />
                      <div className="hero-roster-meta">
                        <span className="hero-roster-name">Alex</span>
                        <span className="hero-roster-status text-[var(--muted-foreground)]">
                          Listening...
                        </span>
                      </div>
                      <span className="hero-roster-score font-mono tabular-nums">2,850</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Compact Mobile View (Single Column, 358px) */
              <div className="hero-compact-layout">
                {/* Top bar */}
                <div className="hero-room-topbar">
                  <span className="hero-code-pill font-mono">VR426D</span>
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    Round 1/10
                  </span>
                  <div className="hero-timer-pill ml-auto">
                    <Timer size={13} weight="bold" />
                    <span className="font-mono tabular-nums">{s.timer}s</span>
                  </div>
                </div>

                {/* Compact Player Deck */}
                <div className="hero-player-deck">
                  <div className="hero-vinyl-groove" data-spinning={s.spinning}>
                    <div className="hero-vinyl-label">
                      <div className="hero-vinyl-spindle" />
                    </div>
                  </div>
                  <div className="hero-mystery-info">
                    <span className="text-xs font-bold text-[var(--foreground)]">
                      Playing Clip
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      Mystery Track · 33 RPM
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
                    <Avatar name="YOU" size={18} tone="accent" />
                    <span className="text-xs font-bold text-[var(--foreground)]">
                      <Roll>{s.rank === 1 ? '#1 You' : '#2 You'}</Roll>
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--primary)]">
                      <Count value={s.score} format={(n) => n.toLocaleString()} /> pts
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
                    <span>Jordan 3,700</span>
                  </div>
                </div>
              </div>
            )}
          </Window>
        )}
      </Stage>
    </div>
  );
}