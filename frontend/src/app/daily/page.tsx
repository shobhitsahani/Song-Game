'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Zap, Trophy, Flame } from 'lucide-react';
import { Navbar } from '@/components/home/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CardSkeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function DailyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [daily, setDaily] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    Promise.all([
      api.daily.get().then(setDaily).catch(() => {}),
      api.daily.streak().then(d => setStreak(d.streak)).catch(() => {}),
      api.daily.leaderboard().then(setLeaderboard).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user]);

  const handlePlayDaily = () => {
    router.push('/room/CREATE?mode=CLASSIC&rounds=10&daily=true');
  };

  const handleClaim = async () => {
    try {
      await api.daily.claim();
      setDaily((prev: any) => ({ ...prev, rewardClaimed: true }));
    } catch {}
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </main>
    );
  }

  const expiresIn = daily?.expiresAt
    ? Math.max(0, Math.floor((new Date(daily.expiresAt).getTime() - Date.now()) / 1000 / 60 / 60))
    : 0;

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" className="mb-4" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-4xl font-bold">
                <span className="text-gradient">Daily Challenge</span>
              </h1>
              <p className="text-muted-foreground mt-1">A new challenge every day</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                  <p className="text-2xl font-bold">{streak}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-xs text-muted-foreground">XP Reward</p>
                  <p className="text-2xl font-bold">+500</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Expires In</p>
                  <p className="text-2xl font-bold">{expiresIn}h</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Today&apos;s Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-bold mb-2">
                {daily?.title || 'Daily Playlist Challenge'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {daily?.description || 'Guess songs from today\'s curated playlist. Complete all rounds to earn bonus XP!'}
              </p>

              {daily?.completed ? (
                <div>
                  <Badge variant="success" size="lg" className="mb-4">Completed!</Badge>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Score</span>
                      <span className="font-bold text-foreground">{daily.score || 0}</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  {!daily.rewardClaimed ? (
                    <Button size="lg" onClick={handleClaim}>
                      <Zap className="w-4 h-4 mr-1" /> Claim Reward
                    </Button>
                  ) : (
                    <Badge variant="secondary" size="lg">Reward Claimed</Badge>
                  )}
                </div>
              ) : (
                <Button size="lg" onClick={handlePlayDaily}>
                  <Trophy className="w-4 h-4 mr-1" /> Play Daily Challenge
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Today&apos;s Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No scores yet today</p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05 }}
                  className="space-y-2"
                >
                  {leaderboard.slice(0, 10).map((entry, i) => (
                    <motion.div
                      key={entry.id || i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 py-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <motion.span
                        className="w-6 text-center font-bold text-sm"
                        style={{
                          color: i === 0 ? '#eab308' : i === 1 ? '#9ca3af' : i === 2 ? '#d97706' : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </motion.span>
                      <span className="flex-1 font-medium text-sm">{entry.username}</span>
                      <motion.span
                        className="font-bold text-sm"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05, type: 'spring' }}
                      >
                        {entry.score}
                      </motion.span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
