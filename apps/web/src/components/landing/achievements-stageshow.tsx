'use client';

import React from 'react';
import {
  Stage,
  Badge,
  Count,
  Roll,
  type Act,
} from '../stageshow/kit';
import { Trophy } from '@phosphor-icons/react';

interface AchievementUnlockState {
  revealed: boolean;
  xp: number;
  progress: number;
  levelUp: boolean;
}

const initial: AchievementUnlockState = {
  revealed: false,
  xp: 450,
  progress: 65,
  levelUp: false,
};

const poster: AchievementUnlockState = {
  revealed: true,
  xp: 500,
  progress: 100,
  levelUp: true,
};

async function script(a: Act<AchievementUnlockState>) {
  // Opening calm beat
  await a.wait(700);

  // Toast arrives smoothly
  await a.set({ revealed: true });
  await a.wait(600);

  // XP fills and level up triggers
  await a.set({ xp: 500, progress: 100, levelUp: true });

  // Payoff holds for 3.5s
  await a.wait(3500);

  // Reverse fade exit to loop seam
  await a.set({ revealed: false });
  await a.wait(400);
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
            className={`w-full h-full rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-3 shadow-lg flex flex-col justify-between transition-all duration-500 ${
              s.revealed
                ? 'opacity-100 translate-y-0 border-[var(--primary)]/50 shadow-[var(--glow)]'
                : 'opacity-40 -translate-y-1'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] shadow-sm shrink-0">
                  <Trophy size={18} weight="fill" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--foreground)]">Achievement Unlocked!</span>
                    <Badge tone="accent" dot>+50 XP</Badge>
                  </div>
                  <span className="text-[11px] text-[var(--muted-foreground)]">First Win · Win your first game</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[var(--primary)]">
                  <Count value={s.xp} /> <span className="text-[10px] text-[var(--muted-foreground)]">/ 500 XP</span>
                </span>
              </div>
            </div>

            {/* XP progress meter */}
            <div className="w-full flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-amber-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-semibold text-[var(--muted-foreground)]">
                <Roll>{s.levelUp ? 'Level 15' : 'Level 14'}</Roll>
              </span>
            </div>
          </div>
        )}
      </Stage>
    </div>
  );
}
