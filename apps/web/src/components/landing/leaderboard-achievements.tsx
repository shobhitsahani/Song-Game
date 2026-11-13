'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Medal,
  ArrowRight,
  Star,
  Fire,
  Lightning,
  GameController,
} from '@phosphor-icons/react';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import type { LeaderboardEntry } from '@song-game/types';

const REAL_ACHIEVEMENTS = [
  { id: 'first_win', title: 'First Win', description: 'Win your first game', icon: Trophy, xp: 50 },
  { id: 'ten_wins', title: 'Double Digits', description: 'Win 10 games', icon: Crown, xp: 200 },
  { id: 'fifty_games', title: 'Dedicated Player', description: 'Play 50 games', icon: GameController, xp: 150 },
  { id: 'five_streak', title: 'On Fire', description: 'Win 5 games in a row', icon: Fire, xp: 250 },
  { id: 'ten_streak', title: 'Unstoppable', description: 'Win 10 games in a row', icon: Lightning, xp: 500 },
  { id: 'level_25', title: 'Music Master', description: 'Reach level 25', icon: Star, xp: 500 },
];

export function LeaderboardAchievementsSection() {
  const [period, setPeriod] = useState<'alltime' | 'weekly' | 'monthly'>('alltime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setHasError(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    fetch(`${apiUrl}/leaderboard?period=${period}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((res) => {
        if (!isCancelled) {
          if (res.success && Array.isArray(res.data)) {
            setEntries(res.data.slice(0, 5));
          } else {
            setEntries([]);
          }
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setHasError(true);
          setEntries([]);
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [period]);

  return (
    <section className="relative py-16 sm:py-24 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column (7 of 12): Leaderboard with real data */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="text-left">
                <h2 className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.02em] text-[var(--foreground)]">
                  Leaderboard
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Top competitive ears ranked by verified match score.
                </p>
              </div>

              <SegmentedControl<'alltime' | 'weekly' | 'monthly'>
                name="homeLeaderboardPeriod"
                value={period}
                onChange={setPeriod}
                size="sm"
                options={[
                  { value: 'alltime', label: 'All Time' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />
            </div>

            {/* Leaderboard Rows / Skeletons */}
            <div className="card-surface p-4 sm:p-6 space-y-2.5 min-h-[354px]">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl bg-[var(--surface-2)]" />
                  ))}
                </div>
              ) : hasError || entries.length === 0 ? (
                <div className="py-8 min-h-[290px] flex flex-col items-center justify-center text-center text-sm text-[var(--muted-foreground)]">
                  <Trophy size={28} className="mx-auto mb-2 text-[var(--muted-foreground)] opacity-40" />
                  <p>Leaderboard standings update after finished rooms.</p>
                  <Link href="/room/create" className="text-xs text-[var(--primary)] font-semibold hover:underline mt-2 inline-block">
                    Start a round to enter the rankings
                  </Link>
                </div>
              ) : (
                entries.map((entry, idx) => {
                  const rank = entry.rank || idx + 1;
                  return (
                    <div
                      key={entry.userId || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-[var(--glass-highlight)] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-center font-mono font-bold text-sm text-[var(--muted-foreground)]">
                          {rank === 1 ? (
                            <Crown size={18} weight="fill" className="text-amber-400 inline" />
                          ) : rank === 2 ? (
                            <Medal size={18} weight="fill" className="text-zinc-300 inline" />
                          ) : rank === 3 ? (
                            <Medal size={18} weight="fill" className="text-amber-700 inline" />
                          ) : (
                            rank
                          )}
                        </span>

                        <Avatar
                          src={entry.avatar}
                          fallback={entry.username.slice(0, 2).toUpperCase()}
                          size="sm"
                          className="border border-[var(--border)]"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                            {entry.username}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Level {entry.level} · {entry.wins} wins
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono font-bold text-sm text-[var(--foreground)] tabular-nums">
                          {(entry.score ?? entry.xp).toLocaleString()} pts
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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

                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 shrink-0">
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
