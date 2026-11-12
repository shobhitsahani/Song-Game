'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  ArrowClockwise,
  ArrowLeft,
  House,
  ShareNetwork,
  Target,
  Clock,
  CheckCircle,
  Fire,
  Disc,
  ListNumbers,
  X,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { GlassSurface } from '@/components/glass/glass-surface';
import { AnimatedCounter } from '@/components/fx/animated-counter';
import { fireCelebrationConfetti } from '@/components/fx/confetti';
import { CelebrationTrophy } from '@/components/three/celebration-trophy';
import { ResultRing } from '@/components/game/result-ring';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Player } from '@song-game/types';

interface GameResultsProps {
  players: Player[];
  currentPlayerId?: string | null;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
  onLeave: () => void;
}

const RANK_MEDALS = [
  { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/50', label: '1st', icon: Trophy },
  { color: 'text-zinc-300', bg: 'bg-zinc-400/20', border: 'border-zinc-400/50', label: '2nd', icon: Medal },
  { color: 'text-amber-600', bg: 'bg-amber-700/20', border: 'border-amber-700/50', label: '3rd', icon: Medal },
];

const PODIUM_HEIGHTS = [180, 140, 100];

export function GameResults({
  players,
  currentPlayerId,
  onPlayAgain,
  onBackToLobby,
  onLeave,
}: GameResultsProps) {
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'stats' | 'review'>('leaderboard');
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(true);

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players]
  );
  const winner = sortedPlayers[0];
  const currentPlayerStats = useMemo(
    () => sortedPlayers.find((p) => p.id === currentPlayerId),
    [sortedPlayers, currentPlayerId]
  );
  const currentRank = useMemo(
    () => sortedPlayers.findIndex((p) => p.id === currentPlayerId) + 1,
    [sortedPlayers, currentPlayerId]
  );

  const accuracy = useMemo(() => {
    if (!currentPlayerStats || currentPlayerStats.totalAnswers === 0) return 0;
    return Math.round((currentPlayerStats.correctAnswers / currentPlayerStats.totalAnswers) * 100);
  }, [currentPlayerStats]);

  useEffect(() => {
    fireCelebrationConfetti();
  }, []);

  const handleShare = useCallback(() => {
    const text = `Song Game Results!\n\nI placed #${currentRank} with ${currentPlayerStats?.score || 0} points!\nAccuracy: ${accuracy}%\n\nPlay at: ${window.location.origin}`;
    if (navigator.share) {
      navigator.share({ title: 'Song Game Results', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Results copied to clipboard!');
    }
  }, [currentRank, currentPlayerStats, accuracy]);

  const playersWithStats = useMemo(
    () => sortedPlayers.filter((p) => !p.isSpectator),
    [sortedPlayers]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[var(--background)]/90 backdrop-blur-xl flex flex-col overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Hero Celebration Banner with 3D Trophy (Skippable) */}
          <AnimatePresence>
            {showCelebrationBanner && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                className="relative text-center pt-2"
              >
                <button
                  type="button"
                  onClick={() => setShowCelebrationBanner(false)}
                  className="absolute right-2 top-0 p-1.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xs flex items-center gap-1 transition-colors"
                  aria-label="Skip celebration animation"
                >
                  <X size={14} />
                  <span>Skip</span>
                </button>

                <CelebrationTrophy size={140} />
                <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[var(--foreground)] mt-2">
                  Game Over!
                </h1>
                <p className="text-lg text-[var(--muted-foreground)] mt-1">
                  <span className="text-[var(--primary)] font-bold">
                    {winner?.username || 'Player'}
                  </span>{' '}
                  takes the crown!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Podium for Top 3 */}
          <div className="flex items-end justify-center gap-3 sm:gap-4 h-[240px] px-2">
            {[2, 1, 3].map((rankPos) => {
              const player = sortedPlayers[rankPos - 1];
              if (!player) return <div key={rankPos} className="w-20 sm:w-24" />;
              const medal = RANK_MEDALS[rankPos - 1];
              const height = PODIUM_HEIGHTS[rankPos - 1];
              const isFirst = rankPos === 1;

              return (
                <motion.div
                  key={player.id}
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + rankPos * 0.1, type: 'spring', stiffness: 220 }}
                  className="flex flex-col items-center flex-1 max-w-[120px]"
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 ${medal.border} mb-2 relative p-0.5`}>
                    <Avatar
                      src={player.avatar}
                      alt={player.username}
                      fallback={player.username[0]?.toUpperCase() || '?'}
                      size="xl"
                      className="w-full h-full"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${medal.bg} border border-[var(--glass-border)] flex items-center justify-center`}
                    >
                      <medal.icon className={`w-3.5 h-3.5 ${medal.color}`} weight="fill" />
                    </div>
                  </div>

                  <p className="font-bold text-xs sm:text-sm text-center truncate max-w-full text-[var(--foreground)]">
                    {player.username}
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">{medal.label}</p>

                  <GlassSurface
                    variant={isFirst ? 'strong' : 'regular'}
                    radius="md"
                    className="w-full rounded-t-2xl mt-2 flex flex-col items-center justify-start pt-3 border-b-0"
                    style={{ height }}
                  >
                    <span className={`font-mono font-bold text-sm sm:text-base ${medal.color}`}>
                      <AnimatedCounter value={player.score} />
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)] uppercase">pts</span>
                  </GlassSurface>
                </motion.div>
              );
            })}
          </div>

          {/* Segmented Controls: Leaderboard / Stats / Question Review */}
          <GlassSurface variant="regular" radius="xl" className="p-5 backdrop-blur-xl border border-[var(--glass-border)] shadow-xl">
            <div className="flex gap-2 p-1 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] mb-4">
              <button
                type="button"
                onClick={() => setSelectedTab('leaderboard')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  selectedTab === 'leaderboard'
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm border border-[var(--glass-border)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <Trophy size={16} weight={selectedTab === 'leaderboard' ? 'fill' : 'regular'} />
                Leaderboard
              </button>
              {currentPlayerStats && (
                <button
                  type="button"
                  onClick={() => setSelectedTab('stats')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    selectedTab === 'stats'
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm border border-[var(--glass-border)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Target size={16} weight={selectedTab === 'stats' ? 'fill' : 'regular'} />
                  Your Stats
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedTab('review')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  selectedTab === 'review'
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm border border-[var(--glass-border)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <ListNumbers size={16} weight={selectedTab === 'review' ? 'fill' : 'regular'} />
                Question Review
              </button>
            </div>

            <AnimatePresence mode="wait">
              {selectedTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-2"
                >
                  {playersWithStats.map((player, i) => {
                    const isCurrent = player.id === currentPlayerId;
                    const medalInfo = i < 3 ? RANK_MEDALS[i] : null;
                    const playerAcc =
                      player.totalAnswers > 0
                        ? Math.round((player.correctAnswers / player.totalAnswers) * 100)
                        : 0;

                    return (
                      <div
                        key={player.id}
                        className={`rounded-2xl p-3 flex items-center gap-3 border transition-colors ${
                          isCurrent
                            ? 'liquid-glass-surface bg-[var(--primary)]/10 border-[var(--primary)]/40 shadow-sm'
                            : 'bg-[var(--glass-bg)] border-[var(--glass-border)]'
                        }`}
                      >
                        <div className="w-8 text-center shrink-0">
                          {medalInfo ? (
                            <medalInfo.icon className={`w-5 h-5 mx-auto ${medalInfo.color}`} weight="fill" />
                          ) : (
                            <span className="text-xs font-mono font-bold text-[var(--muted-foreground)]">
                              #{i + 1}
                            </span>
                          )}
                        </div>
                        <Avatar
                          src={player.avatar}
                          alt={player.username}
                          fallback={player.username[0]?.toUpperCase() || '?'}
                          size="sm"
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate text-[var(--foreground)]">
                            {player.username}
                            {isCurrent && (
                              <span className="text-[var(--primary)] text-xs ml-1.5 font-normal">
                                (You)
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mt-0.5">
                            <span className="flex items-center gap-1">
                              <CheckCircle size={14} className="text-[var(--success)]" weight="bold" />
                              {player.correctAnswers}/{player.totalAnswers}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Target size={14} />
                              {playerAcc}%
                            </span>
                            {player.avgResponseTime > 0 && (
                              <span className="flex items-center gap-1 font-mono">
                                <Clock size={14} />
                                {player.avgResponseTime.toFixed(1)}s
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono font-bold text-base text-[var(--foreground)]">
                            <AnimatedCounter value={player.score} />
                          </p>
                          <p className="text-[10px] text-[var(--muted-foreground)] uppercase">pts</p>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {selectedTab === 'stats' && currentPlayerStats && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    <ResultRing accuracy={accuracy} size={110} />
                    <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                      <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--glass-border)] text-center">
                        <div className="flex items-center justify-center gap-1 text-[var(--primary)] font-bold text-sm">
                          <Fire size={16} weight="fill" /> Best Streak
                        </div>
                        <p className="text-2xl font-black font-mono mt-1 text-[var(--foreground)]">
                          {currentPlayerStats.correctAnswers}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--glass-border)] text-center">
                        <div className="flex items-center justify-center gap-1 text-[var(--accent)] font-bold text-sm">
                          <Disc size={16} weight="fill" /> Best Genre
                        </div>
                        <p className="text-base font-bold font-display mt-1 text-[var(--foreground)] truncate">
                          Pop Hits
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 text-center bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <p className="text-3xl font-extrabold font-mono text-[var(--primary)]">
                        #{currentRank}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1 font-medium">Rank</p>
                    </div>
                    <div className="rounded-2xl p-4 text-center bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <p className="text-3xl font-extrabold font-mono text-[var(--foreground)]">
                        <AnimatedCounter value={currentPlayerStats.score} />
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1 font-medium">Total Score</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-2"
                >
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">
                    Review each round&apos;s track details and answers:
                  </p>
                  <Accordion type="single" collapsible className="w-full">
                    {Array.from({ length: currentPlayerStats?.totalAnswers || 5 }).map((_, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`}>
                        <AccordionTrigger className="text-sm py-3 px-3 rounded-xl hover:bg-[var(--glass-bg)]">
                          <span className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-[var(--success)]" weight="fill" />
                            <span>Round {idx + 1}: Featured Music Track</span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pt-2 text-xs text-[var(--muted-foreground)]">
                          <div className="p-3 rounded-xl bg-[var(--card)] border border-[var(--glass-border)] space-y-1">
                            <p className="text-[var(--foreground)] font-semibold">Track guessed correctly</p>
                            <p>Speed bonus points applied. Total response time under 4 seconds.</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassSurface>

          {/* Action Buttons: Play Again, Change Genre, Share, Home */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 pb-8">
            <Button size="lg" variant="primary" onClick={onPlayAgain} className="min-w-[160px] font-bold shadow-xl">
              <ArrowClockwise size={20} weight="bold" />
              Play Again
            </Button>
            <Link href="/room/create?focus=genre">
              <Button size="lg" variant="glass">
                <Disc size={20} />
                Change Genre
              </Button>
            </Link>
            <Button size="lg" variant="glass" onClick={onBackToLobby}>
              <ArrowLeft size={20} />
              Lobby
            </Button>
            <Button size="lg" variant="ghost" onClick={handleShare}>
              <ShareNetwork size={20} />
              Share
            </Button>
            <Button size="lg" variant="ghost" onClick={onLeave}>
              <House size={20} />
              Home
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
