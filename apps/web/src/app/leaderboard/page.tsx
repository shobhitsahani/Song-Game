'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Crown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import type { LeaderboardEntry } from '@song-game/types';

type Period = 'weekly' | 'monthly' | 'alltime';

const RANK_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [period, setPeriod] = useState<Period>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isAuthenticated) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/leaderboard?period=${period}`, { credentials: 'include' })
        .then((r) => r.json())
        .then((res) => { if (res.success) setEntries(res.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, router, period]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-56 mb-8" />
        <div className="space-y-3">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      <div className="pt-24 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="w-6 h-6 text-purple-400" /> Leaderboard</h1>
            <div className="flex gap-1">
              {(['weekly', 'monthly', 'alltime'] as Period[]).map((p) => (
                <Badge key={p} variant={period === p ? 'default' : 'outline'} className="cursor-pointer capitalize" onClick={() => setPeriod(p)}>
                  {p === 'alltime' ? 'All Time' : p}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {entries.length > 0 ? entries.map((entry, i) => {
              const isMe = entry.userId === user?.id;
              return (
                <motion.div
                  key={entry.userId || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`glass rounded-xl p-4 flex items-center gap-4 transition-all ${isMe ? 'ring-1 ring-purple-500/50 bg-purple-500/5' : 'glass-hover'}`}
                >
                  <div className="w-10 text-center shrink-0">
                    {i < 3 ? (
                      <Crown className={cn('w-6 h-6 mx-auto', RANK_COLORS[i])} />
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                    )}
                  </div>
                  <Avatar src={entry.avatar} alt={entry.username} fallback={entry.username[0] ?? '?'} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate flex items-center gap-2">
                      {entry.username}
                      {isMe && <Badge variant="premium" size="sm">YOU</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <Trophy className="w-3 h-3 inline mr-1 text-yellow-400" />{entry.wins} wins
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold tabular-nums">{entry.xp?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </motion.div>
              );
            }) : (
              <EmptyState icon={TrendingUp} title="No rankings yet" description="Play games to appear on the leaderboard." />
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
