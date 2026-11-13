'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, TrendUp, Crown } from '@phosphor-icons/react';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/landing/navbar';
import { SegmentedControl } from '@/components/ui/segmented-control';
import type { LeaderboardEntry } from '@song-game/types';

type Period = 'weekly' | 'monthly' | 'alltime';

const RANK_COLORS = ['text-amber-400', 'text-zinc-300', 'text-amber-600'];

export default function LeaderboardPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [period, setPeriod] = useState<Period>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If not authenticated, we can still show public mock/demo or allow viewing
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/leaderboard?period=${period}`,
      { credentials: 'include' }
    )
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setEntries(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-28 pb-28 px-4 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-56 mb-8 rounded-2xl" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-28 pt-28 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Sticky Header with Filter Pills */}
          <div className="sticky top-20 z-30 py-3 bg-[var(--background)]/85 backdrop-blur-xl -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none border-b border-[var(--border)] sm:border-0 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight flex items-center gap-2.5 text-[var(--foreground)]">
              <TrendUp size={28} weight="bold" className="text-[var(--primary)]" />
              Global Rankings
            </h1>

            <SegmentedControl<Period>
              name="leaderboardPeriod"
              value={period}
              onChange={setPeriod}
              size="sm"
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'alltime', label: 'All Time' },
              ]}
            />
          </div>

        {/* Entries Table */}
        <div className="space-y-2">
          {entries.length > 0 ? (
            entries.map((entry, i) => {
              const isMe = entry.userId === user?.id;
              return (
                <motion.div
                  key={entry.userId || i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                >
                  <div
                    className={cn(
                      'p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 border bg-[var(--surface-1)] shadow-xs',
                      isMe
                        ? 'border-[var(--primary)]/60 bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30'
                        : 'border-[var(--border)] hover:border-[var(--glass-highlight)]'
                    )}
                  >
                    <div className="w-9 text-center shrink-0">
                      {i < 3 ? (
                        <Crown size={24} weight="fill" className={cn('mx-auto', RANK_COLORS[i])} />
                      ) : (
                        <span className="text-base font-mono font-bold text-[var(--muted-foreground)]">
                          #{i + 1}
                        </span>
                      )}
                    </div>
                    <Avatar
                      src={entry.avatar}
                      alt={entry.username}
                      fallback={entry.username[0] ?? '?'}
                      size="default"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base truncate flex items-center gap-2 text-[var(--foreground)]">
                        {entry.username}
                        {isMe && (
                          <Badge variant="primary" size="sm" className="text-[10px]">
                            YOU
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                        <Trophy size={14} weight="fill" className="text-amber-400" />
                        <span className="font-mono">{entry.wins}</span> wins
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold font-mono text-lg tabular-nums text-[var(--foreground)]">
                        {entry.xp?.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-[var(--muted-foreground)] uppercase">XP</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="card-surface p-12 text-center rounded-2xl">
              <TrendUp size={44} weight="duotone" className="text-[var(--primary)] mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-[var(--foreground)]">
                No rankings yet
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto">
                Finish a round to claim your spot on the listening room board.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </main>
    </>
  );
}
