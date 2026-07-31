'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2, Target, Flame, Star, Music, LogOut } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { formatXp } from '@/lib/utils';
import { getLevelProgress } from '@song-game/shared';
import type { UserStats } from '@song-game/types';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();
  const [data, setData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isAuthenticated) {
      api.users.stats()
        .then((res) => { if (res.success) setData(res.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl md:col-span-1" />
          <Skeleton className="h-64 rounded-2xl md:col-span-2" />
        </div>
      </main>
    );
  }

  const stats = data;
  const levelInfo = stats ? getLevelProgress(stats.xp) : null;
  const xpToNext = levelInfo?.nextLevelXP || 1000;
  const xpInLevel = levelInfo?.currentXP || 0;
  const level = stats?.level ?? levelInfo?.level ?? 1;

  return (
    <main className="min-h-screen pb-16">
      <div className="pt-24 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar src={user?.avatar} alt={user?.username} fallback={user?.username?.[0] ?? '?'} size="xl" />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">{user?.displayName || user?.username}</h1>
                <p className="text-sm text-muted-foreground mt-1">@{user?.username}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-400" /> Level {level}</span>
                    <span className="text-muted-foreground">{formatXp(xpInLevel)} / {formatXp(xpToNext)} XP</span>
                  </div>
                  <Progress value={(xpInLevel / xpToNext) * 100} className="h-2" />
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary"><Trophy className="w-3 h-3 mr-1" /> {stats?.wins ?? 0} Wins</Badge>
                  <Badge variant="secondary"><Gamepad2 className="w-3 h-3 mr-1" /> {stats?.totalGames ?? 0} Games</Badge>
                  <Badge variant="secondary"><Music className="w-3 h-3 mr-1" /> {stats?.correctAnswers ?? 0} Guesses</Badge>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Trophy, label: 'Wins', value: stats?.wins ?? 0, color: 'text-yellow-400' },
              { icon: Gamepad2, label: 'Games', value: stats?.totalGames ?? 0, color: 'text-blue-400' },
              { icon: Target, label: 'Win Rate', value: stats?.totalGames ? `${Math.round((stats.wins / stats.totalGames) * 100)}%` : '0%', color: 'text-green-400' },
              { icon: Flame, label: 'Best Streak', value: stats?.longestStreak ?? 0, color: 'text-orange-400' },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4 text-center">
                <div className={`w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center ${s.color} bg-${s.color.slice(5, -4)}/10`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
