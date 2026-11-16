'use client';

import React from 'react';
import {
  Stage,
  Window,
  Phone,
  Notification,
  LockScreen,
  Avatar,
  Badge,
  Count,
  Roll,
  WALLPAPER,
  type Act,
} from '../stageshow/kit';
import { Disc, Trophy, Lightning, Check } from '@phosphor-icons/react';
import './hero-stageshow.css';

interface HeroState {
  locked: boolean;
  selectedKey: 'A' | 'B' | 'C' | 'D' | null;
  score: number;
  rank: number;
  jordanLocked: boolean;
  timer: number;
  showSatellite: boolean;
}

const initial: HeroState = {
  locked: false,
  selectedKey: null,
  score: 3250,
  rank: 2,
  jordanLocked: false,
  timer: 15,
  showSatellite: false,
};

const poster: HeroState = {
  locked: true,
  selectedKey: 'B',
  score: 4250,
  rank: 1,
  jordanLocked: true,
  timer: 13,
  showSatellite: true,
};

async function script(a: Act<HeroState>) {
  // Calm opening beat
  await a.wait(700);

  // Jordan locks in
  await a.set({ timer: 14, jordanLocked: true });
  await a.wait(400);

  // Cursor targets Option B
  await a.move('hero-opt-b');
  await a.wait(300);

  // Click & lock in answer
  await a.click();
  await a.set({
    locked: true,
    selectedKey: 'B',
    score: 4250,
    rank: 1,
    timer: 13,
    showSatellite: true,
  });

  // Hold payoff frame for 2.8s
  await a.wait(2800);

  // Calm reset to loop seam
  await a.set({ showSatellite: false });
  await a.wait(200);
  await a.set(initial);
  await a.wait(600);
}

const REST = {
  wide: { x: 420, y: 390 },
  compact: { x: 280, y: 400 },
};

export function HeroStageshow() {
  return (
    <div className="hero-stageshow-container" aria-hidden="true" role="presentation">
      <Stage<HeroState>
        width={560}
        height={430}
        compact={{ below: 540, width: 358, height: 460 }}
        initial={initial}
        poster={poster}
        script={script}
        play="loop"
        cursor={{ at: REST, style: 'arrow', ripple: true }}
        className="look-songgame"
      >
        {(s, _rect, layout) => (
          <>
            <Window
              title="SongGame — Room VR426D"
              url="songgame.io/room/VR426D"
              chrome="native"
              lights="color"
              toolbar={
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-1">
                    <Avatar name="AX" size={20} tone="person" />
                    <Avatar
                      name="JD"
                      size={20}
                      tone="person"
                      ring={s.jordanLocked ? 'confirmed' : 'pending'}
                    />
                    <Avatar name="SM" size={20} tone="person" />
                    <Avatar
                      name="YOU"
                      size={20}
                      tone="accent"
                      ring={s.locked ? 'confirmed' : undefined}
                    />
                  </div>
                  <Badge tone={s.locked ? 'success' : 'accent'} dot>
                    Round 1/10
                  </Badge>
                </div>
              }
              className="hero-window"
            >
              <div className="hero-content">
                {/* Vinyl turntable clip player */}
                <div className="hero-player-card">
                  <div className="hero-vinyl-disc" data-spinning={!s.locked}>
                    <div className="hero-vinyl-center">
                      <div className="hero-vinyl-spindle" />
                    </div>
                  </div>

                  <div className="hero-track-info">
                    <div className="flex items-center justify-between">
                      <span className="hero-track-title">Neon Midnight</span>
                      <span className="text-[11px] font-mono font-semibold text-[var(--primary)] flex items-center gap-1">
                        <Lightning size={12} weight="fill" />
                        0:{s.timer < 10 ? `0${s.timer}` : s.timer}
                      </span>
                    </div>
                    <span className="hero-track-artist">The Velvet Waves · 33 RPM</span>
                    <div className="hero-progress-wrap">
                      <div
                        className="hero-progress-bar"
                        style={{ width: `${((15 - s.timer + (s.locked ? 1.8 : 0)) / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 4 Answer options */}
                <div className="hero-options-grid">
                  <div className="hero-opt-btn" data-target="hero-opt-a">
                    <span className="hero-opt-key">A</span>
                    <span className="hero-opt-text">Echoes in the Rain</span>
                  </div>

                  <div
                    className="hero-opt-btn"
                    data-target="hero-opt-b"
                    data-selected={s.selectedKey === 'B'}
                  >
                    <span className="hero-opt-key">B</span>
                    <span className="hero-opt-text">Neon Midnight</span>
                    {s.locked && s.selectedKey === 'B' && (
                      <span className="ml-auto text-[var(--success)] flex items-center gap-1 text-[11px] font-bold">
                        <Check size={14} weight="bold" /> +1,000
                      </span>
                    )}
                  </div>

                  <div className="hero-opt-btn" data-target="hero-opt-c">
                    <span className="hero-opt-key">C</span>
                    <span className="hero-opt-text">Solar Flare</span>
                  </div>

                  <div className="hero-opt-btn" data-target="hero-opt-d">
                    <span className="hero-opt-key">D</span>
                    <span className="hero-opt-text">Starlight Avenue</span>
                  </div>
                </div>

                {/* Live Standings strip */}
                <div className="hero-standings-bar">
                  <div className="hero-standings-list">
                    <div className="hero-player-chip">
                      <span className="hero-player-rank">
                        <Roll>{s.rank === 1 ? '#1' : '#2'}</Roll>
                      </span>
                      <Avatar name="YOU" size={18} tone="accent" />
                      <span className="text-[var(--foreground)] font-bold">You</span>
                      <span className="text-[var(--primary)] font-mono font-bold">
                        <Count value={s.score} format={(n) => n.toLocaleString()} /> pts
                      </span>
                      {s.locked && (
                        <span className="text-[10px] text-[var(--success)] font-semibold">▲1</span>
                      )}
                    </div>

                    <div className="hero-player-chip opacity-70 hidden sm:flex">
                      <span className="hero-player-rank">{s.rank === 1 ? '#2' : '#1'}</span>
                      <Avatar name="JD" size={18} tone="person" />
                      <span>Jordan</span>
                      <span className="font-mono text-[var(--muted-foreground)]">3,700</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                    <Trophy size={14} className="text-[var(--primary)]" weight="fill" />
                    <span>Speed 1.8s</span>
                  </div>
                </div>
              </div>
            </Window>

            {/* Satellite phone (wide only) */}
            {layout === 'wide' && (
              <Phone
                width={196}
                frame="pro"
                dark
                wallpaper={WALLPAPER}
                className="hero-phone-satellite"
              >
                <LockScreen size="satellite" stack="top">
                  <Notification
                    icon={<Disc size={18} weight="fill" className="text-[var(--primary)]" />}
                    title="SongGame · Room VR426D"
                    body="Jordan joined your room"
                  />
                </LockScreen>
              </Phone>
            )}
          </>
        )}
      </Stage>
    </div>
  );
}
