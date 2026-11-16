'use client';

import React from 'react';
import {
  Stage,
  Count,
  Roll,
  type Act,
} from '../stageshow/kit';
import { Trophy } from '@phosphor-icons/react';

interface AchievementUnlockState {
  unlocked: boolean;
  xp: number;
  progress: number;
  levelUp: boolean;
}

const initial: AchievementUnlockState = {
  unlocked: false,
  xp: 450,
  progress: 65,
  levelUp: false,
};

const poster: AchievementUnlockState = {
  unlocked: true,
  xp: 500,
  progress: 100,
  levelUp: true,
};

async function script(a: Act<AchievementUnlockState>) {
  // Opening beat
  await a.wait(800);

  // Trigger unlock event
  await a.set({ unlocked: true });
  await a.wait(500);

  // XP meter fills to 100% and triggers Level Up
  await a.set({ xp: 500, progress: 100, levelUp: true });

  // Hold payoff frame for 3.2s
  await a.wait(3200);

  // Reset to initial
  await a.set(initial);
  await a.wait(600);
}

export function AchievementsStageshow() {
  return (
    <div id="achievements-stageshow-container" className="w-full mb-3" aria-hidden="true">
      <Stage<AchievementUnlockState>
        width={440}
        height={90}
        compact={{ below: 440, width: 330, height: 90 }}
        initial={initial}
        poster={poster}
        script={script}
        play="loop"
        className="look-songgame"
      >
        {(s) => (
          <div
            className={`w-full h-full rounded-[var(--radius-control)] bg-[var(--surface-2)] border p-3 flex flex-col justify-between transition-all duration-300 ${
              s.unlocked
                ? 'border-[var(--primary)] shadow-sm'
                : 'border-[var(--border)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center transition-colors ${
                    s.unlocked
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--surface-3)] text-[var(--muted-foreground)]'
                  }`}
                >
                  <Trophy size={18} weight="fill" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--foreground)]">
                      {s.unlocked ? 'Achievement Unlocked!' : 'Recent Progress'}
                    </span>
                    <span className="text-[12px] font-mono font-semibold text-[var(--primary)]">
                      +50 XP
                    </span>
                  </div>
                  <span className="text-[12px] text-[var(--muted-foreground)]">
                    First Win · Win your first game
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-semibold text-[var(--foreground)] tabular-nums">
                  <Count value={s.xp} />{' '}
                  <span className="text-[12px] text-[var(--muted-foreground)]">/ 500 XP</span>
                </span>
              </div>
            </div>

            {/* XP progress meter */}
            <div className="w-full flex items-center gap-2.5 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
              <span className="text-[12px] font-mono font-semibold text-[var(--muted-foreground)]">
                <Roll>{s.levelUp ? 'Level 15' : 'Level 14'}</Roll>
              </span>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}