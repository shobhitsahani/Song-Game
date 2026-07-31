'use client';

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Heart, Skull, Volume2, VolumeX, Zap, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GameModeBadge } from '@/components/shared/game-mode-badge';
import { Scoreboard } from '@/components/game/scoreboard';
import { GameMode, GameSettings, Round, GamePlayer } from '@/types';

interface GameScreenProps {
  mode: GameMode;
  currentRound: Round | null;
  roundNumber: number;
  totalRounds: number;
  timeLeft: number;
  gameStatus: 'IDLE' | 'COUNTDOWN' | 'PREVIEW' | 'PLAYING' | 'REVEAL' | 'FINISHED';
  revealData: { correctIndex: number; correctAnswer: string; points: number; basePoints: number; speedBonus: number; speedTier: string; responseTime: number; wasCorrect: boolean } | null;
  players: GamePlayer[];
  currentUserId?: string;
  settings: GameSettings | null;
  options: string[];
  selectedAnswer: string | null;
  correctIndex: number | null;
  previewUrl?: string | null;
  onSubmitAnswer: (answer: string) => void;
}

export const GameScreen = memo(function GameScreen({
  mode, currentRound, roundNumber, totalRounds, timeLeft, gameStatus,
  revealData, players, currentUserId, settings, options, selectedAnswer,
  correctIndex, previewUrl, onSubmitAnswer,
}: GameScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (gameStatus === 'PLAYING' && previewUrl) {
      const audio = audioRef.current || new Audio();
      audioRef.current = audio;
      audio.src = previewUrl;
      audio.muted = isMuted;
      audio.play().catch(() => {});
    }
  }, [gameStatus, previewUrl, isMuted]);

  useEffect(() => {
    if (gameStatus !== 'PLAYING' && audioRef.current) {
      audioRef.current.pause();
    }
  }, [gameStatus]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const isHardcore = mode === 'HARDCORE';
  const isSurvival = mode === 'SURVIVAL';
  const isReveal = gameStatus === 'REVEAL';
  const isPlaying = gameStatus === 'PLAYING';
  const timeLow = timeLeft <= 5 && timeLeft > 0;

  const currentPlayer = useMemo(() => players.find((p) => p.id === currentUserId), [players, currentUserId]);
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players]);
  const alivePlayers = useMemo(() => players.filter((p) => p.isAlive !== false), [players]);
  const isAlive = currentPlayer?.isAlive !== false;
  const showAliveCount = isSurvival && alivePlayers.length < players.length;

  const handleOptionClick = useCallback((option: string) => {
    if (!isPlaying || selectedAnswer || !isAlive) return;
    onSubmitAnswer(option);
  }, [isPlaying, selectedAnswer, isAlive, onSubmitAnswer]);

  const getOptionStyle = useCallback((option: string, index: number) => {
    if (isReveal && correctIndex !== null) {
      if (index === correctIndex) {
        return 'border-green-500 bg-green-500/10 text-green-400 ring-2 ring-green-500/30';
      }
      if (option === selectedAnswer && index !== correctIndex) {
        return 'border-red-500 bg-red-500/10 text-red-400 ring-2 ring-red-500/30';
      }
      return 'border-white/5 bg-white/5 text-muted-foreground opacity-50';
    }

    if (option === selectedAnswer) {
      return 'border-purple-500 bg-purple-500/10 text-purple-400 ring-2 ring-purple-500/30';
    }

    return 'border-white/10 bg-white/5 text-foreground hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer';
  }, [isReveal, correctIndex, selectedAnswer]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <GameModeBadge mode={mode} />
              <Badge variant="secondary" className="text-sm gap-1">
                <Music className="w-3.5 h-3.5" />
                Round {roundNumber}/{totalRounds}
              </Badge>
              {showAliveCount && (
                <Badge variant="success" className="gap-1">
                  <Heart className="w-3 h-3" /> {alivePlayers.length} alive
                </Badge>
              )}
              {isSurvival && !isAlive && (
                <Badge variant="destructive" className="gap-1">
                  <Skull className="w-3 h-3" /> Eliminated
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              {timeLeft > 0 && (
                <Badge variant={timeLow ? 'destructive' : 'secondary'} className="text-sm gap-1">
                  {timeLeft}s
                </Badge>
              )}
              <Badge variant={isPlaying ? 'success' : 'secondary'} className="text-sm gap-1">
                {isPlaying ? '🎵 Playing' : isReveal ? '✅ Revealed' : '⏳ Preview'}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                {currentRound?.song?.albumArt ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20"
                  >
                    <img
                      src={currentRound.song.albumArt}
                      alt="Album art"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {isPlaying && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [8, 20, 12, 18, 8] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                              className="w-1 bg-green-400 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-44 h-44 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-purple-800 to-pink-800 flex items-center justify-center shadow-2xl shadow-purple-500/20"
                  >
                    <Music className="w-16 h-16 text-white/30" />
                  </motion.div>
                )}

                {isReveal && currentRound?.song?.songTitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full text-center"
                  >
                    <Badge variant="premium" size="lg" className="shadow-lg shadow-purple-500/30">
                      {currentRound.song.songTitle}
                      {currentRound.song.artist && ` - ${currentRound.song.artist}`}
                    </Badge>
                  </motion.div>
                )}
              </div>

              <AnimatePresence>
                {isReveal && revealData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 text-center"
                  >
                    <motion.div
                      key={revealData.wasCorrect ? 'correct' : 'wrong'}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`text-2xl font-bold ${revealData.wasCorrect ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {revealData.wasCorrect ? 'Correct!' : 'Wrong!'}
                    </motion.div>

                    {revealData.wasCorrect && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-2 space-y-1"
                      >
                        <div className="flex items-center justify-center gap-3 text-sm">
                          <span className="text-green-400">Base: +{revealData.basePoints}</span>
                          {revealData.speedBonus > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                              className="text-yellow-400 font-bold"
                            >
                              Speed Bonus: +{revealData.speedBonus}
                            </motion.span>
                          )}
                        </div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-lg font-bold text-green-400"
                        >
                          Total: +{revealData.points}
                        </motion.div>
                        <p className="text-xs text-muted-foreground">
                          Answered in {revealData.responseTime}s
                          {revealData.speedTier === 'legendary' && ' - LEGENDARY!'}
                          {revealData.speedTier === 'lightning' && ' - Lightning Fast!'}
                          {revealData.speedTier === 'blazing' && ' - Blazing!'}
                          {revealData.speedTier === 'fast' && ' - Fast Finger!'}
                          {revealData.speedTier === 'quick' && ' - Quick!'}
                          {revealData.speedTier === 'decent' && ' - Decent!'}
                          {revealData.speedTier === 'slow' && ' - Slow and steady'}
                          {revealData.speedTier === 'barely' && ' - Barely made it!'}
                        </p>
                      </motion.div>
                    )}

                    {!revealData.wasCorrect && (
                      <p className="text-base text-muted-foreground mt-2">
                        The answer was: {revealData.correctAnswer}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {timeLow && isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="mt-4"
                  >
                    <Badge variant="destructive" className="animate-pulse gap-1 text-sm px-4 py-1.5">
                      <AlertTriangle className="w-4 h-4" /> Hurry! {timeLeft}s left
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {(isPlaying || isReveal) && options.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
              {options.map((option, index) => (
                <motion.button
                  key={`${roundNumber}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleOptionClick(option)}
                  disabled={!isPlaying || selectedAnswer !== null || !isAlive}
                  className={`relative rounded-xl border p-4 text-left transition-all duration-200 font-medium text-lg ${getOptionStyle(option, index)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 truncate">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-4"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Music className="w-4 h-4" /> Leaderboard
          </h3>
          <Scoreboard
            players={sortedPlayers}
            currentUserId={currentUserId}
            isSurvival={isSurvival}
          />
        </motion.div>
      </div>
    </div>
  );
});
