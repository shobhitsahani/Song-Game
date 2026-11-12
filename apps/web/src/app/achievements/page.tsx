'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Trophy,
  Lock,
  Star,
  MusicNotes,
  Lightning,
  Fire,
  Crown,
  GameController,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/stores/auth';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserStats } from '@song-game/types';

const ACHIEVEMENTS = [
  { id: 'first_win', title: 'First Win', description: 'Win your first game', icon: Trophy, xp: 50, condition: (s: UserStats | null) => (s?.wins ?? 0) >= 1 },
  { id: 'ten_wins', title: 'Double Digits', description: 'Win 10 games', icon: Crown, xp: 200, condition: (s: UserStats | null) => (s?.wins ?? 0) >= 10 },
  { id: 'fifty_games', title: 'Dedicated Player', description: 'Play 50 games', icon: GameController, xp: 150, condition: (s: UserStats | null) => (s?.totalGames ?? 0) >= 50 },
  { id: 'hundred_games', title: 'Veteran', description: 'Play 100 games', icon: MusicNotes, xp: 300, condition: (s: UserStats | null) => (s?.totalGames ?? 0) >= 100 },
  { id: 'five_streak', title: 'On Fire', description: 'Win 5 games in a row', icon: Fire, xp: 250, condition: (s: UserStats | null) => (s?.longestStreak ?? 0) >= 5 },
  { id: 'ten_streak', title: 'Unstoppable', description: 'Win 10 games in a row', icon: Lightning, xp: 500, condition: (s: UserStats | null) => (s?.longestStreak ?? 0) >= 10 },
  { id: 'level_5', title: 'Getting Started', description: 'Reach level 5', icon: Star, xp: 75, condition: (s: UserStats | null) => (s?.level ?? 0) >= 5 },
  { id: 'level_10', title: 'Rising Star', description: 'Reach level 10', icon: Star, xp: 200, condition: (s: UserStats | null) => (s?.level ?? 0) >= 10 },
  { id: 'level_25', title: 'Music Master', description: 'Reach level 25', icon: Crown, xp: 500, condition: (s: UserStats | null) => (s?.level ?? 0) >= 25 },
];

export default function AchievementsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }
    if (isAuthenticated) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/users/stats`, { credentials: 'include' })
        .then((r) => r.json())
        .then((res) => { if (res.success) setStats(res.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </main>
    );
  }

  const earned = ACHIEVEMENTS.filter((a) => a.condition(stats)).length;
  const total = ACHIEVEMENTS.length;

  return (
    <main className="min-h-screen pb-16">
      <div className="pt-24 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-400" /> Achievements</h1>
            <Badge variant="secondary" className="text-sm">{earned} / {total}</Badge>
          </div>
          <Progress value={(earned / total) * 100} className="h-2" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = achievement.condition(stats);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass rounded-xl p-4 flex items-center gap-4 transition-all ${isUnlocked ? 'glass-hover' : 'opacity-50 grayscale'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-yellow-500/10 text-yellow-400' : 'bg-muted text-muted-foreground'}`}>
                    {isUnlocked ? <achievement.icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${isUnlocked ? '' : 'text-muted-foreground'}`}>{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-yellow-400 mt-1">+{achievement.xp} XP</p>
                  </div>
                  {isUnlocked && <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
