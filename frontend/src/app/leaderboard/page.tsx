'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Trophy, ArrowLeft, Medal, Target, Zap, Crown, Users, Calendar, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/home/Navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaderboardSkeleton } from '@/components/ui/skeleton';
import { useLeaderboardStore } from '@/store/leaderboard';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { global, xp, wins, accuracy, friends, weekly, monthly, loading, loadGlobal, loadXP, loadWins, loadAccuracy, loadFriends, loadWeekly, loadMonthly } = useLeaderboardStore();

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    loadGlobal();
    loadXP();
    loadWins();
    loadAccuracy();
    loadFriends();
    loadWeekly();
    loadMonthly();
  }, [user]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const renderLeaderboard = (entries: any[], emptyMessage: string) => {
    if (loading) return <LeaderboardSkeleton rows={10} />;
    if (entries.length === 0) {
      return <div className="text-center py-12"><p className="text-muted-foreground">{emptyMessage}</p></div>;
    }
    return (
      <div className="space-y-2">
        {entries.map((entry, i) => {
          const rank = i + 1;
          const isCurrentUser = entry.id === user?.id || entry.userId === user?.id;
          return (
            <motion.div
              key={entry.id || entry.userId || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                'flex items-center gap-4 rounded-xl px-4 py-3 transition-all',
                isCurrentUser ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-card border border-border hover:border-purple-500/30'
              )}
            >
              <div className="w-8 text-center font-bold text-lg">
                {getRankIcon(rank) || <span className={cn('text-muted-foreground', rank <= 10 ? 'text-foreground' : '')}>{rank}</span>}
              </div>
              <Avatar className="w-10 h-10 ring-2 ring-purple-500/20">
                <AvatarImage src={entry.avatar} />
                <AvatarFallback>{entry.username?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{entry.username}</span>
                  {entry.title && <Badge variant="secondary" size="sm">{entry.title}</Badge>}
                  {isCurrentUser && <Badge variant="premium" size="sm">You</Badge>}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  {entry.wins !== undefined && <span>{entry.wins} wins</span>}
                  {entry.accuracy !== undefined && <span>{entry.accuracy}% acc</span>}
                  {entry.totalGames !== undefined && <span>{entry.totalGames} games</span>}
                  {entry.score !== undefined && <span>{entry.score} pts</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">{entry.xp?.toLocaleString() || entry.score?.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">XP</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" className="mb-4" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-4xl font-bold mb-8">
            <span className="text-gradient">Leaderboard</span>
          </h1>

          <Tabs defaultValue="global" className="w-full">
            <TabsList className="glass w-full justify-start mb-6">
              <TabsTrigger value="global"><Trophy className="w-4 h-4 mr-1" /> Global</TabsTrigger>
              <TabsTrigger value="xp"><Zap className="w-4 h-4 mr-1" /> XP</TabsTrigger>
              <TabsTrigger value="wins"><Crown className="w-4 h-4 mr-1" /> Wins</TabsTrigger>
              <TabsTrigger value="accuracy"><Target className="w-4 h-4 mr-1" /> Accuracy</TabsTrigger>
              <TabsTrigger value="friends"><Users className="w-4 h-4 mr-1" /> Friends</TabsTrigger>
              <TabsTrigger value="weekly"><Calendar className="w-4 h-4 mr-1" /> Weekly</TabsTrigger>
              <TabsTrigger value="monthly"><TrendingUp className="w-4 h-4 mr-1" /> Monthly</TabsTrigger>
            </TabsList>

            <TabsContent value="global">{renderLeaderboard(global, 'No data yet')}</TabsContent>
            <TabsContent value="xp">{renderLeaderboard(xp, 'No data yet')}</TabsContent>
            <TabsContent value="wins">{renderLeaderboard(wins, 'No data yet')}</TabsContent>
            <TabsContent value="accuracy">{renderLeaderboard(accuracy, 'No data yet')}</TabsContent>
            <TabsContent value="friends">{renderLeaderboard(friends, 'Add friends to see them here')}</TabsContent>
            <TabsContent value="weekly">{renderLeaderboard(weekly, 'No weekly data yet. Play games this week!')}</TabsContent>
            <TabsContent value="monthly">{renderLeaderboard(monthly, 'No monthly data yet. Play games this month!')}</TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
