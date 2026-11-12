'use client';

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import {
  MusicNotes,
  Heart,
  Skull,
  SpeakerHigh,
  SpeakerSlash,
  Lightning,
  Trophy,
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Scoreboard } from '@/components/game/scoreboard';
import { TimerRing } from '@/components/game/timer-ring';
import { ProgressSegments } from '@/components/game/progress-segments';
import { AudioWaveform } from '@/components/fx/audio-waveform';
import { AnswerOption } from '@/components/game/answer-option';
import { GlassSurface } from '@/components/glass/glass-surface';
import { soundFx } from '@/lib/sound-fx';
import type {
  Player,
  GameMode,
  RoundPayload,
  GuessResultPayload,
  PlayerGuessPayload,
} from '@song-game/types';

export type GameStatus =
  | 'IDLE'
  | 'COUNTDOWN'
  | 'PREVIEW'
  | 'PLAYING'
  | 'REVEAL'
  | 'FINISHED';

interface GameScreenProps {
  mode: GameMode;
  currentRound: RoundPayload | null;
  roundNumber: number;
  totalRounds: number;
  timeLeft: number;
  gameStatus: GameStatus;
  revealData: GuessResultPayload | null;
  players: Player[];
  currentPlayerId?: string | null;
  options: string[];
  selectedAnswer: string | null;
  correctIndex: number | null;
  playerGuesses: PlayerGuessPayload[];
  onSubmitAnswer: (answer: string) => void;
}

export const GameScreen = memo(function GameScreen({
  mode,
  currentRound,
  roundNumber,
  totalRounds,
  timeLeft,
  gameStatus,
  revealData,
  players,
  currentPlayerId,
  options,
  selectedAnswer,
  correctIndex,
  playerGuesses,
  onSubmitAnswer,
}: GameScreenProps) {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRevealSoundRef = useRef(false);

  const isHardcore = mode === 'HARDCORE';
  const isSurvival = mode === 'SURVIVAL';
  const isReveal = gameStatus === 'REVEAL';
  const isPlaying = gameStatus === 'PLAYING';

  const currentPlayer = useMemo(
    () => players.find((p) => p.id === currentPlayerId),
    [players, currentPlayerId]
  );
  const alivePlayers = useMemo(
    () => players.filter((p) => p.isAlive !== false),
    [players]
  );
  const isAlive = currentPlayer?.isAlive !== false;
  const showAliveCount = isSurvival && alivePlayers.length < players.length;

  const playersById = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players]
  );
  const guessesByOption = useMemo(() => {
    const map = new Map<string, PlayerGuessPayload[]>();
    for (const guess of playerGuesses) {
      const list = map.get(guess.option) || [];
      list.push(guess);
      map.set(guess.option, list);
    }
    return map;
  }, [playerGuesses]);

  const roundResults = useMemo(() => {
    if (!isReveal) return [];
    return [...players].sort((a, b) => {
      const aGuessed = a.guessTime !== undefined;
      const bGuessed = b.guessTime !== undefined;
      if (aGuessed !== bGuessed) return aGuessed ? -1 : 1;
      return (a.guessTime ?? Infinity) - (b.guessTime ?? Infinity);
    });
  }, [isReveal, players]);

  // Audio Playback
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying && currentRound?.previewUrl) {
      el.src = currentRound.previewUrl;
      el.volume = isMuted ? 0 : 1;
      el.play().catch(() => {});
    } else if (isReveal || gameStatus === 'FINISHED') {
      el.pause();
    }
  }, [isPlaying, isReveal, gameStatus, currentRound, isMuted]);

  // Play reveal sound once
  useEffect(() => {
    if (isReveal && revealData && !hasPlayedRevealSoundRef.current) {
      hasPlayedRevealSoundRef.current = true;
      if (revealData.wasCorrect) {
        soundFx.playCorrect();
      } else {
        soundFx.playWrong();
      }
    }
    if (!isReveal) {
      hasPlayedRevealSoundRef.current = false;
    }
  }, [isReveal, revealData]);

  const handleOptionClick = useCallback(
    (option: string) => {
      if (
        (gameStatus !== 'PLAYING' && gameStatus !== 'PREVIEW') ||
        selectedAnswer ||
        !isAlive
      )
        return;
      onSubmitAnswer(option);
    },
    [gameStatus, selectedAnswer, isAlive, onSubmitAnswer]
  );

  // Keyboard Shortcuts (1-4 and A-D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'PLAYING' && gameStatus !== 'PREVIEW') return;
      if (selectedAnswer || !isAlive) return;
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      const key = e.key.toUpperCase();
      let index = -1;
      if (['1', '2', '3', '4'].includes(key)) {
        index = parseInt(key, 10) - 1;
      } else if (['A', 'B', 'C', 'D'].includes(key)) {
        index = key.charCodeAt(0) - 65;
      }

      if (index >= 0 && index < options.length) {
        e.preventDefault();
        handleOptionClick(options[index]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, selectedAnswer, isAlive, options, handleOptionClick]);

  return (
    <>
      <audio ref={audioRef} preload="none" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <div className="lg:col-span-3 space-y-6">
          {/* Main Question Card with Glass Surface */}
          <GlassSurface
            variant="strong"
            radius="xl"
            className="p-6 sm:p-8 backdrop-blur-2xl border border-[var(--glass-border)] shadow-2xl relative overflow-hidden"
          >
            {/* Top Bar inside question: Progress, Badges, Timer, Mute */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--glass-border)]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <ProgressSegments
                  currentRound={roundNumber}
                  totalRounds={totalRounds}
                  className="min-w-[140px]"
                />

                {showAliveCount && (
                  <Badge variant="success" className="gap-1">
                    <Heart size={14} weight="fill" /> {alivePlayers.length} alive
                  </Badge>
                )}
                {isSurvival && !isAlive && (
                  <Badge variant="destructive" className="gap-1">
                    <Skull size={14} weight="fill" /> Eliminated
                  </Badge>
                )}
                {isHardcore && (
                  <Badge variant="destructive" className="gap-1">
                    <Lightning size={14} weight="fill" /> Hardcore
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                <TimerRing timeLeft={timeLeft} totalTime={15} size={50} />

                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className="p-2.5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--card)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] outline-none"
                  aria-label={isMuted ? 'Unmute preview' : 'Mute preview'}
                >
                  {isMuted ? (
                    <SpeakerSlash size={20} className="text-[var(--muted-foreground)]" />
                  ) : (
                    <SpeakerHigh size={20} className="text-[var(--primary)]" />
                  )}
                </button>
              </div>
            </div>

            {/* Centre Prompt: Music Cover / Vinyl Placeholder */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative">
                {currentRound?.albumArt ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-2xl border-2 border-[var(--glass-border)]"
                  >
                    <Image
                      src={currentRound.albumArt}
                      alt="Album art"
                      fill
                      sizes="(max-width: 768px) 176px, 224px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {isPlaying && (
                      <div className="absolute bottom-3 left-0 right-0">
                        <AudioWaveform isPlaying={true} barCount={10} size="sm" />
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-44 h-44 sm:w-56 sm:h-56 rounded-3xl liquid-glass-surface bg-[var(--glass-bg)] border border-[var(--glass-border)] flex flex-col items-center justify-center shadow-2xl relative"
                  >
                    <MusicNotes size={56} weight="duotone" className="text-[var(--primary)] mb-2" />
                    <AudioWaveform isPlaying={isPlaying} barCount={8} size="sm" />
                  </motion.div>
                )}

                {/* Song Title Reveal Pill */}
                {isReveal && currentRound?.songTitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 text-center"
                  >
                    <Badge variant="premium" size="lg" className="shadow-lg py-1.5 px-4 font-bold text-sm">
                      <MusicNotes size={16} weight="fill" className="mr-1.5" />
                      {currentRound.songTitle}
                      {currentRound.artist && ` - ${currentRound.artist}`}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Answers Grid */}
            {(gameStatus === 'PREVIEW' || isPlaying || isReveal) && options.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto mt-8">
                {options.map((option, index) => {
                  const guessers = guessesByOption.get(option) || [];
                  return (
                    <AnswerOption
                      key={`${roundNumber}-${index}`}
                      option={option}
                      index={index}
                      selectedAnswer={selectedAnswer}
                      correctIndex={correctIndex}
                      isReveal={isReveal}
                      disabled={
                        (gameStatus !== 'PLAYING' && gameStatus !== 'PREVIEW') ||
                        selectedAnswer !== null ||
                        !isAlive
                      }
                      guessers={guessers}
                      playersById={playersById}
                      onSelect={handleOptionClick}
                    />
                  );
                })}
              </div>
            )}
          </GlassSurface>
        </div>

        {/* Right Column: Live Leaderboard and Round Results */}
        <div className="lg:col-span-1">
          <GlassSurface
            variant="regular"
            radius="xl"
            className="p-5 backdrop-blur-xl border border-[var(--glass-border)] shadow-xl"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 flex items-center gap-2">
              <Trophy size={16} weight="duotone" className="text-[var(--primary)]" />
              Leaderboard
            </h3>
            <Scoreboard
              players={players}
              currentPlayerId={currentPlayerId}
              isSurvival={isSurvival}
            />

            {/* Reveal Feedback Card */}
            {isReveal && (
              <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                <AnimatePresence>
                  {revealData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <div
                        className={`text-lg font-bold font-display ${
                          revealData.wasCorrect
                            ? 'text-[var(--success)]'
                            : 'text-[var(--destructive)]'
                        }`}
                      >
                        {revealData.wasCorrect ? 'Correct!' : 'Wrong!'}
                      </div>

                      {revealData.wasCorrect && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-center gap-3 text-xs text-[var(--muted-foreground)]">
                            <span>Base: +{revealData.basePoints}</span>
                            {revealData.speedBonus > 0 && (
                              <span className="text-amber-400 font-semibold">
                                Speed: +{revealData.speedBonus}
                              </span>
                            )}
                          </div>
                          <div className="text-xl font-bold font-mono text-[var(--success)]">
                            +{revealData.points} pts
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Answered in {revealData.responseTime}s
                          </p>
                        </div>
                      )}

                      {!revealData.wasCorrect && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-2">
                          Answer: <span className="font-semibold text-[var(--foreground)]">{revealData.correctAnswer}</span>
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {roundResults.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                      Round Timing
                    </p>
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                      {roundResults.map((player) => {
                        const isYou = player.id === currentPlayerId;
                        const timedOut = player.guessTime === undefined;
                        const points = player.roundPoints ?? 0;
                        return (
                          <div
                            key={player.id}
                            className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs ${
                              isYou
                                ? 'bg-[var(--primary)]/15 border border-[var(--primary)]/30'
                                : 'bg-[var(--glass-bg)] border border-[var(--glass-border)]'
                            }`}
                          >
                            <Avatar
                              src={player.avatar}
                              alt={player.username}
                              fallback={player.username[0]?.toUpperCase() || '?'}
                              size="sm"
                              className="shrink-0 w-6 h-6"
                            />
                            <span className="flex-1 truncate font-medium text-[var(--foreground)]">
                              {player.username}
                            </span>
                            <span className="text-mono text-[var(--muted-foreground)]">
                              {timedOut ? '-' : `${player.guessTime!.toFixed(1)}s`}
                            </span>
                            <span
                              className={`font-mono font-bold ${
                                points > 0 ? 'text-[var(--success)]' : 'text-[var(--muted-foreground)]'
                              }`}
                            >
                              +{points}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassSurface>
        </div>
      </div>
    </>
  );
});
