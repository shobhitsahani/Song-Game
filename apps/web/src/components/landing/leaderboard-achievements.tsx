'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  ArrowRight,
  Star,
  Fire,
  Lightning,
  GameController,
} from '@phosphor-icons/react';
import { LeaderboardStageshow } from './leaderboard-stageshow';
import { AchievementsStageshow } from './achievements-stageshow';

const REAL_ACHIEVEMENTS = [
  { id: 'first_win', title: 'First Win', description: 'Win your first game', icon: Trophy, xp: 50 },
  { id: 'ten_wins', title: 'Double Digits', description: 'Win 10 games', icon: Crown, xp: 200 },
  { id: 'fifty_games', title: 'Dedicated Player', description: 'Play 50 games', icon: GameController, xp: 150 },
  { id: 'five_streak', title: 'On Fire', description: 'Win 5 games in a row', icon: Fire, xp: 250 },
  { id: 'ten_streak', title: 'Unstoppable', description: 'Win 10 games in a row', icon: Lightning, xp: 500 },
  { id: 'level_25', title: 'Music Master', description: 'Reach level 25', icon: Star, xp: 500 },
];

export function LeaderboardAchievementsSection() {
  return (
    <section className="relative py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column (7 of 12): Leaderboard StageShow window */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="mb-6 text-left">
              <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.02em] text-[var(--foreground)]">
                Leaderboard
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Top competitive ears ranked by verified match score.
              </p>
            </div>

            {/* StageShow Leaderboard Window */}
            <LeaderboardStageshow />
          </div>

          <div className="mt-4 text-left">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              See full leaderboard <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>

        {/* Right Column (5 of 12): Real Achievement badges */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="text-left mb-6">
              <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.02em] text-[var(--foreground)]">
                Achievements
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Unlock badges and XP multipliers as your trivia instincts sharpen.
              </p>
            </div>

            <div className="card-surface p-4 sm:p-6 space-y-3">
              <AchievementsStageshow />

              {REAL_ACHIEVEMENTS.map((ach) => {
                const Icon = ach.icon;
                return (
                  <div
                    key={ach.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-[var(--glass-highlight)] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shrink-0">
                      <Icon size={20} weight="duotone" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                        {ach.title}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {ach.description}
                      </p>
                    </div>

                    <span className="text-xs font-mono font-bold text-[var(--badge-xp)] bg-[var(--badge-xp-bg)] px-2 py-0.5 rounded border border-[var(--badge-xp-border)] shrink-0">
                      +{ach.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 text-left">
            <Link
              href="/achievements"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              View all achievements <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
