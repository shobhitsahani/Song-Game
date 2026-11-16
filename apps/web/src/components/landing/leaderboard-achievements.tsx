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
import { Container } from '@/components/ui/container';

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
    <section className="relative landing-section scroll-mt-[88px]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column (7 of 12): Leaderboard StageShow window */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="flex flex-col">
              <div className="landing-heading-group">
                <h2 className="landing-h2">
                  Leaderboard
                </h2>
                <p className="landing-subline">
                  Top players ranked by verified match score across rooms.
                </p>
              </div>

              {/* StageShow Leaderboard Window - flush with left edge */}
              <div className="w-full">
                <LeaderboardStageshow />
              </div>
            </div>

            <div className="mt-4 text-left">
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--primary)] hover:underline"
              >
                See full leaderboard <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>

          {/* Right Column (5 of 12): Real Achievement badges */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="flex flex-col">
              <div className="landing-heading-group">
                <h2 className="landing-h2">
                  Achievements
                </h2>
                <p className="landing-subline">
                  Unlock milestones and earn XP as your trivia ear sharpens.
                </p>
              </div>

              {/* Achievements Container with inline header and 6 rows */}
              <div className="rounded-[var(--radius-card)] bg-[var(--surface-1)] border border-[var(--border)] p-5 shadow-xs flex flex-col justify-between">
                {/* Inline Header (replaces nested card): Level 14 · 450 / 500 XP with thin progress bar */}
                <div className="pb-4 mb-2 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between text-[13px] font-medium mb-2">
                    <span className="font-bold text-[var(--foreground)]">Level 14</span>
                    <span className="font-mono text-[var(--muted-foreground)] tabular-nums">450 / 500 XP</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                    <div className="h-full bg-[var(--primary)] rounded-full w-[90%] transition-all duration-500" />
                  </div>
                </div>

                {/* 6 Real Achievement rows with hover states, text 13-14px */}
                <div className="flex flex-col divide-y divide-[var(--border)]">
                  {REAL_ACHIEVEMENTS.map((ach) => {
                    const Icon = ach.icon;
                    return (
                      <div
                        key={ach.id}
                        className="flex items-center justify-between py-2.5 px-2 rounded-[var(--radius-control)] hover:bg-[var(--surface-2)]/60 transition-colors first:pt-1 last:pb-1"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <Icon size={18} className="text-[var(--primary)] shrink-0" weight="bold" />
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-[var(--foreground)] truncate">
                              {ach.title}
                            </p>
                            <p className="text-[13px] text-[var(--muted-foreground)] truncate">
                              {ach.description}
                            </p>
                          </div>
                        </div>

                        <span className="text-[13px] font-mono font-semibold text-[var(--primary)] tabular-nums shrink-0">
                          +{ach.xp} XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 text-left">
              <Link
                href="/achievements"
                className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--primary)] hover:underline"
              >
                View all achievements <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
