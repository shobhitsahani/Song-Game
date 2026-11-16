'use client';

import React from 'react';
import {
  Stage,
  Window,
  Avatar,
  Badge,
  Count,
  type Act,
} from '../stageshow/kit';
import { Crown, Medal } from '@phosphor-icons/react';

type Period = 'alltime' | 'weekly' | 'monthly';

interface LeaderboardState {
  period: Period;
}

interface Entry {
  rank: number;
  username: string;
  level: number;
  wins: number;
  points: number;
  initials: string;
}

const LEADERBOARD_DATA: Record<Period, Entry[]> = {
  alltime: [
    { rank: 1, username: 'BeatMaster', level: 42, wins: 128, points: 48250, initials: 'BM' },
    { rank: 2, username: 'VinylVibe', level: 38, wins: 104, points: 41700, initials: 'VV' },
    { rank: 3, username: 'GroovePilot', level: 35, wins: 89, points: 36900, initials: 'GP' },
    { rank: 4, username: 'EchoRider', level: 31, wins: 72, points: 29450, initials: 'ER' },
    { rank: 5, username: 'RhythmQueen', level: 29, wins: 65, points: 24100, initials: 'RQ' },
  ],
  weekly: [
    { rank: 1, username: 'GroovePilot', level: 35, wins: 18, points: 9450, initials: 'GP' },
    { rank: 2, username: 'EchoRider', level: 31, wins: 15, points: 8200, initials: 'ER' },
    { rank: 3, username: 'BeatMaster', level: 42, wins: 12, points: 7850, initials: 'BM' },
    { rank: 4, username: 'NeonNomad', level: 26, wins: 11, points: 6900, initials: 'NN' },
    { rank: 5, username: 'VinylVibe', level: 38, wins: 9, points: 5400, initials: 'VV' },
  ],
  monthly: [
    { rank: 1, username: 'VinylVibe', level: 38, wins: 44, points: 26800, initials: 'VV' },
    { rank: 2, username: 'BeatMaster', level: 42, wins: 41, points: 24300, initials: 'BM' },
    { rank: 3, username: 'RhythmQueen', level: 29, wins: 35, points: 21950, initials: 'RQ' },
    { rank: 4, username: 'GroovePilot', level: 35, wins: 30, points: 18600, initials: 'GP' },
    { rank: 5, username: 'EchoRider', level: 31, wins: 27, points: 15200, initials: 'ER' },
  ],
};

const initial: LeaderboardState = { period: 'alltime' };
const poster: LeaderboardState = { period: 'weekly' };

async function script(a: Act<LeaderboardState>) {
  await a.wait(900);

  // Switch to Weekly
  await a.move('tab-weekly');
  await a.wait(250);
  await a.click();
  await a.set({ period: 'weekly' });
  await a.wait(2500);

  // Switch to Monthly
  await a.move('tab-monthly');
  await a.wait(250);
  await a.click();
  await a.set({ period: 'monthly' });
  await a.wait(2500);

  // Switch back to All Time
  await a.move('tab-alltime');
  await a.wait(250);
  await a.click();
  await a.set({ period: 'alltime' });
  await a.wait(1200);
}

const REST = {
  wide: { x: 340, y: 30 },
  compact: { x: 260, y: 30 },
};

export function LeaderboardStageshow() {
  return (
    <div className="w-full" aria-hidden="true">
      <Stage<LeaderboardState>
        width={580}
        height={390}
        compact={{ below: 580, width: 350, height: 420 }}
        initial={initial}
        poster={poster}
        script={script}
        play="loop"
        cursor={{ at: REST, style: 'arrow', ripple: true }}
        className="look-songgame"
      >
        {(s) => {
          const list = LEADERBOARD_DATA[s.period];
          return (
            <Window
              title="SongGame Leaderboard"
              chrome="native"
              toolbar={
                <div className="flex items-center gap-1 bg-[var(--surface-2)] p-0.5 rounded-lg border border-[var(--border)] text-xs">
                  <button
                    type="button"
                    data-target="tab-alltime"
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      s.period === 'alltime'
                        ? 'bg-[var(--surface-1)] text-[var(--foreground)] shadow-sm'
                        : 'text-[var(--muted-foreground)]'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    type="button"
                    data-target="tab-weekly"
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      s.period === 'weekly'
                        ? 'bg-[var(--surface-1)] text-[var(--foreground)] shadow-sm'
                        : 'text-[var(--muted-foreground)]'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    data-target="tab-monthly"
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      s.period === 'monthly'
                        ? 'bg-[var(--surface-1)] text-[var(--foreground)] shadow-sm'
                        : 'text-[var(--muted-foreground)]'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              }
              className="w-full h-full bg-[var(--surface-1)] border border-[var(--border)] shadow-md rounded-2xl overflow-hidden"
            >
              <div className="p-3 sm:p-4 space-y-2">
                {list.map((entry) => (
                  <div
                    key={entry.username}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center font-mono font-bold text-sm text-[var(--muted-foreground)] flex items-center justify-center">
                        {entry.rank === 1 ? (
                          <Crown size={17} weight="fill" className="text-amber-400 inline" />
                        ) : entry.rank === 2 ? (
                          <Medal size={17} weight="fill" className="text-zinc-300 inline" />
                        ) : entry.rank === 3 ? (
                          <Medal size={17} weight="fill" className="text-amber-700 inline" />
                        ) : (
                          entry.rank
                        )}
                      </span>

                      <Avatar name={entry.initials} size={28} tone="person" />

                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">
                          {entry.username}
                        </div>
                        <div className="text-[11px] text-[var(--muted-foreground)]">
                          Level {entry.level} · {entry.wins} wins
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-xs sm:text-sm text-[var(--foreground)] tabular-nums">
                        <Count value={entry.points} format={(n) => `${n.toLocaleString()} pts`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Window>
          );
        }}
      </Stage>
    </div>
  );
}
