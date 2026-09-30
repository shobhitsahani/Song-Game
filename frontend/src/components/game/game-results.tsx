'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Home, RotateCcw, Target, Clock, BadgeCheck, Sparkles, Medal, Share2, ArrowLeft, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Confetti } from '@/components/game/confetti';
import { WinnerAnimation } from '@/components/game/WinnerAnimation';
import { XpBar, XpAnimation } from '@/components/shared';
import { getLevelProgress, formatTime } from '@/lib/utils';
import { GamePlayer } from '@/types';

interface GameResultsProps {
  players: GamePlayer[];
  currentUserId?: string;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onLeave: () => void;
}

const RANK_MEDALS = [
  { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'ring-yellow-500/40', label: '1st', icon: Trophy },
  { color: 'text-gray-300', bg: 'bg-gray-400/20', border: 'ring-gray-400/40', label: '2nd', icon: Medal },
  { color: 'text-amber-600', bg: 'bg-amber-600/20', border: 'ring-amber-600/40', label: '3rd', icon: Medal },
];

const PODIUM_HEIGHTS = [200, 160, 120];

function CountUp({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
}

export function GameResults({
  players, currentUserId, onPlayAgain, onBackToLobby, onLeave,
}: GameResultsProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'stats'>('leaderboard');
  const [xpEarned] = useState(() => Math.floor(50 + Math.random() * 150));

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players]);
  const winner = sortedPlayers[0];
  const currentPlayerStats = useMemo(() => sortedPlayers.find((p) => p.id === currentUserId), [sortedPlayers, currentUserId]);
  const currentRank = useMemo(() => sortedPlayers.findIndex((p) => p.id === currentUserId) + 1, [sortedPlayers, currentUserId]);

  const currentXp = currentPlayerStats?.score || 0;
  const { level, currentXp: levelXp, nextLevelXp, progress } = useMemo(
    () => getLevelProgress((currentPlayerStats?.score || 0) * 10),
    [currentPlayerStats]
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = useCallback(() => {
    const text = `🎵 Song Game Results!\n\nI placed #${currentRank} with ${currentPlayerStats?.score || 0} points!\nCorrect: ${currentPlayerStats?.correctAnswers || 0}/${currentPlayerStats?.totalAnswers || 0}\n\nPlay at: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
  }, [currentRank, currentPlayerStats]);

  const playersWithStats = useMemo(
    () => sortedPlayers.filter((p) => !p.isSpectator),
    [sortedPlayers]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-black/95 via-purple-950/25 to-black/95 backdrop-blur-md flex flex-col overflow-hidden"
    >
      {showConfetti && <Confetti />}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
              className="relative inline-block mb-4"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl shadow-yellow-500/30">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: [0, 1.5, 1], rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold mb-2"
            >
              Game Over!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-muted-foreground"
            >
              <span className="text-gradient font-bold">{winner?.username}</span> wins the game!
            </motion.p>

            {showConfetti && xpEarned > 0 && (
              <div className="relative w-full h-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2">
                  <XpAnimation xpGained={xpEarned} />
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-10"
          >
            <div className="flex items-end justify-center gap-4 mb-4 h-[240px]">
              {[2, 1, 3].map((rankPos) => {
                const player = sortedPlayers[rankPos - 1];
                if (!player) return <div key={rankPos} className="w-24" />;
                const medal = RANK_MEDALS[rankPos - 1];
                const height = PODIUM_HEIGHTS[rankPos - 1];
                const isFirst = rankPos === 1;

                return (
                  <motion.div
                    key={player.id}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + rankPos * 0.15, type: 'spring', stiffness: 200 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + rankPos * 0.15 }}
                      className={`w-16 h-16 rounded-full ring-4 ${medal.border} mb-2 relative`}
                    >
                      <Avatar className="w-full h-full">
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback className="text-lg">{player.username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${medal.bg} flex items-center justify-center ring-2 ring-black`}>
                        <medal.icon className={`w-3.5 h-3.5 ${medal.color}`} />
                      </div>
                    </motion.div>
                    <p className="font-bold text-sm text-center truncate max-w-[80px]">{player.username}</p>
                    <p className="text-xs text-muted-foreground">{medal.label}</p>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{ delay: 1.2 + rankPos * 0.1, duration: 0.4 }}
                      className={`w-20 rounded-t-xl mt-2 ${isFirst ? 'bg-gradient-to-t from-yellow-500/30 to-yellow-500/10' : 'bg-white/5'} flex items-start justify-center pt-3`}
                      style={{ height }}
                    >
                      <span className={`font-bold text-lg ${medal.color}`}>
                        <CountUp value={player.score} />
                      </span>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="glass rounded-2xl p-4 mb-6"
          >
            <div className="flex gap-2 mb-4">
              <Button
                variant={selectedTab === 'leaderboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTab('leaderboard')}
                className="flex-1"
              >
                <Trophy className="w-4 h-4 mr-1" /> Leaderboard
              </Button>
              {currentPlayerStats && (
                <Button
                  variant={selectedTab === 'stats' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedTab('stats')}
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-1" /> Your Stats
                </Button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {selectedTab === 'leaderboard' ? (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-2"
                >
                  {playersWithStats.map((player, i) => {
                    const isCurrent = player.id === currentUserId;
                    const medalInfo = i < 3 ? RANK_MEDALS[i] : null;
                    const accuracy = player.totalAnswers > 0
                      ? Math.round((player.correctAnswers / player.totalAnswers) * 100)
                      : 0;

                    return (
                      <motion.div
                        key={player.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`glass rounded-xl p-3 flex items-center gap-3 ${
                          isCurrent ? 'ring-2 ring-gold/30 bg-amber-500/5' : ''
                        } ${i === 0 ? 'ring-1 ring-yellow-500/30' : ''}`}
                      >
                        <div className="w-8 text-center shrink-0">
                          {medalInfo ? (
                            <medalInfo.icon className={`w-5 h-5 mx-auto ${medalInfo.color}`} />
                          ) : (
                            <span className="text-sm text-muted-foreground font-medium">#{i + 1}</span>
                          )}
                        </div>
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage src={player.avatar} />
                          <AvatarFallback className="text-xs">{player.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {player.username}
                            {isCurrent && <span className="text-violet-400 text-xs ml-1">(You)</span>}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3 text-green-400" />
                              {player.correctAnswers}/{player.totalAnswers}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {accuracy}%
                            </span>
                            {player.avgResponseTime > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {player.avgResponseTime.toFixed(1)}s
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-lg">
                            <CountUp value={player.score} />
                          </p>
                          <p className="text-[10px] text-muted-foreground">pts</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {currentPlayerStats && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="glass rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-gradient">#{currentRank}</p>
                          <p className="text-xs text-muted-foreground mt-1">Rank</p>
                        </div>
                        <div className="glass rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-gradient">
                            <CountUp value={currentPlayerStats.score} />
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Score</p>
                        </div>
                        <div className="glass rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-green-400">
                            {currentPlayerStats.totalAnswers > 0
                              ? Math.round((currentPlayerStats.correctAnswers / currentPlayerStats.totalAnswers) * 100)
                              : 0}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Accuracy</p>
                        </div>
                        <div className="glass rounded-xl p-4 text-center">
                          <p className="text-3xl font-bold text-blue-400">
                            {currentPlayerStats.avgResponseTime > 0
                              ? currentPlayerStats.avgResponseTime.toFixed(1)
                              : '-'}s
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Avg Response</p>
                        </div>
                      </div>

                      <Separator className="my-2" />

                      <div className="glass rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" /> XP Earned
                          </h4>
                          <Badge variant="premium" className="text-sm px-3 py-1">
                            +<CountUp value={xpEarned} /> XP
                          </Badge>
                        </div>
                        <XpBar
                          xp={(currentPlayerStats.score || 0) * 10 + xpEarned}
                          showLabel
                          size="md"
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex flex-wrap gap-3 justify-center pb-8"
          >
            <Button size="lg" onClick={onPlayAgain} className="gap-2 bg-gradient-to-r from-gold to-ember hover:brightness-110 shadow-lg shadow-gold/25">
              <RotateCcw className="w-4 h-4" /> Play Again
            </Button>
            <Button size="lg" variant="outline" onClick={onBackToLobby} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Lobby
            </Button>
            <Button size="lg" variant="glass" onClick={onLeave} className="gap-2">
              <Home className="w-4 h-4" /> Home
            </Button>
            <Button size="lg" variant="ghost" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" /> Share Results
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
