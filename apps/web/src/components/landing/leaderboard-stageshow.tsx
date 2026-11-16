'use client';

import React from 'react';
import {
  Stage,
  Window,
  Avatar,
  Count,
  type Act,
} from '../stageshow/kit';

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
  await a.wait(2800);

  // Switch to Monthly
  await a.move('tab-monthly');
  await a.wait(250);
  await a.click();
  await a.set({ period: 'monthly' });
  await a.wait(2800);

  // Switch back to All Time
  await a.move('tab-alltime');
  await a.wait(250);
  await a.click();
  await a.set({ period: 'alltime' });
  await a.wait(1400);
}

const REST = {
  wide: { x: 530, y: 360 },
  compact: { x: 310, y: 380 },
};

export function LeaderboardStageshow() {
  return (
    <div id="leaderboard-stageshow-container" className="w-full" aria-hidden="true">
      <Stage<LeaderboardState>
        width={580}
        height={390}
        compact={{ below: 580, width: 340, height: 410 }}
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
              title="Global Standings"
              chrome="native"
              lights="color"
              toolbar={
                /* Clean Segmented Control Tabs */
                <div className="ss-seg-tabs">
                  <span
                    role="button"
                    tabIndex={0}
                    data-target="tab-alltime"
                    data-active={s.period === 'alltime' ? 'true' : undefined}
                    className="ss-seg-tab"
                  >
                    All Time
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    data-target="tab-weekly"
                    data-active={s.period === 'weekly' ? 'true' : undefined}
                    className="ss-seg-tab"
                  >
                    Weekly
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    data-target="tab-monthly"
                    data-active={s.period === 'monthly' ? 'true' : undefined}
                    className="ss-seg-tab"
                  >
                    Monthly
                  </span>
                </div>
              }
              className="w-full h-full bg-[var(--surface-1)] border border-[var(--border)] shadow-sm rounded-[var(--radius-card)] overflow-hidden"
            >
              <div className="p-3 sm:p-4 space-y-2">
                {list.map((entry) => (
                  <div
                    key={entry.username}
                    className="flex items-center justify-between p-2.5 rounded-[var(--radius-control)] bg-[var(--surface-2)] border border-[var(--border)] transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Consistent tabular rank numerals 1-5 */}
                      <span className="w-5 text-center font-mono font-bold text-xs sm:text-sm text-[var(--muted-foreground)] tabular-nums">
                        {entry.rank}
                      </span>

                      <Avatar name={entry.initials} size={28} tone="person" />

                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">
                          {entry.username}
                        </div>
                        <div className="text-[11px] text-[var(--muted-foreground)] font-mono">
                          Level {entry.level} · {entry.wins} wins
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-semibold text-xs sm:text-sm text-[var(--foreground)] tabular-nums">
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