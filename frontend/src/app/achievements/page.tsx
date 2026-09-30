'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Unlock, Sparkles, Award } from 'lucide-react';
import { Navbar } from '@/components/home/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    api.achievements.mine().then(setAchievements).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'COMMON': return 'border-gray-500/30 text-gray-400';
      case 'RARE': return 'border-blue-500/30 text-blue-400';
      case 'EPIC': return 'border-purple-500/30 text-purple-400';
      case 'LEGENDARY': return 'border-yellow-500/30 text-yellow-400';
      default: return 'border-gray-500/30 text-gray-400';
    }
  };

  const AchievementCard = ({ achievement, index }: { achievement: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className={cn(!achievement.unlocked && 'opacity-50')}>
        <CardContent className="p-5 flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0',
            achievement.unlocked ? 'bg-purple-500/10' : 'bg-secondary'
          )}>
            {achievement.unlocked ? achievement.icon || '🏆' : <Lock className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{achievement.title || achievement.name}</h3>
              <Badge variant="outline" size="sm" className={getRarityColor(achievement.rarity)}>
                {achievement.rarity || 'COMMON'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
            <div className="flex items-center gap-3 text-xs">
              {achievement.unlocked ? (
                <span className="text-green-400 flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
              {achievement.xpReward > 0 && (
                <span className="text-yellow-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> +{achievement.xpReward} XP
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" className="mb-4" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <Award className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-4xl font-bold">
                <span className="text-gradient">Achievements</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                {unlocked.length} / {achievements.length} unlocked
              </p>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="glass w-full justify-start mb-6">
              <TabsTrigger value="all">All ({achievements.length})</TabsTrigger>
              <TabsTrigger value="unlocked">Unlocked ({unlocked.length})</TabsTrigger>
              <TabsTrigger value="locked">Locked ({locked.length})</TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
              </div>
            ) : (
              <>
                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {achievements.map((a, i) => <AchievementCard key={a.id || i} achievement={a} index={i} />)}
                    {achievements.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-12">No achievements found</p>}
                  </div>
                </TabsContent>
                <TabsContent value="unlocked">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {unlocked.map((a, i) => <AchievementCard key={a.id || i} achievement={a} index={i} />)}
                    {unlocked.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-12">No achievements unlocked yet</p>}
                  </div>
                </TabsContent>
                <TabsContent value="locked">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {locked.map((a, i) => <AchievementCard key={a.id || i} achievement={a} index={i} />)}
                    {locked.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-12">All achievements unlocked!</p>}
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
