'use client';

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { Avatar } from '@/components/ui/avatar';
import { liquidSpring } from '@/lib/motion';
import type { Player, PlayerGuessPayload } from '@song-game/types';

interface AnswerOptionProps {
  option: string;
  index: number;
  selectedAnswer: string | null;
  correctIndex: number | null;
  isReveal: boolean;
  disabled: boolean;
  guessers: PlayerGuessPayload[];
  playersById: Map<string, Player>;
  onSelect: (option: string) => void;
}

export function AnswerOption({
  option,
  index,
  selectedAnswer,
  correctIndex,
  isReveal,
  disabled,
  guessers,
  playersById,
  onSelect,
}: AnswerOptionProps) {
  const isSelected = selectedAnswer === option;
  const isCorrect = isReveal && index === correctIndex;
  const isWrong = isReveal && isSelected && index !== correctIndex;
  const letter = String.fromCharCode(65 + index); // A, B, C, D

  let statusClass = 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--card)] hover:border-[var(--glass-highlight)]';
  if (isCorrect) {
    statusClass = 'border-[var(--success)] bg-[var(--success)]/15 text-[var(--foreground)] shadow-lg shadow-[var(--success)]/20';
  } else if (isWrong) {
    statusClass = 'border-[var(--destructive)] bg-[var(--destructive)]/15 text-[var(--foreground)] shadow-lg shadow-[var(--destructive)]/20';
  } else if (isSelected) {
    statusClass = 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--foreground)] shadow-lg shadow-[var(--glow)]';
  } else if (isReveal) {
    statusClass = 'border-[var(--glass-border)] opacity-40 bg-[var(--glass-bg)]';
  }

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(option)}
      disabled={disabled}
      animate={
        isWrong
          ? {
              x: [0, -4, 4, -4, 4, 0],
              transition: { duration: 0.24, ease: 'easeInOut' },
            }
          : undefined
      }
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      className={clsx(
        'relative min-h-[60px] w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer disabled:cursor-default',
        statusClass
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="selectedAnswerHighlight"
          className="absolute inset-0 rounded-2xl ring-2 ring-[var(--primary)] pointer-events-none"
          transition={liquidSpring}
        />
      )}

      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Key Badge: Letter + Number shortcut hint */}
        <div
          className={clsx(
            'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition-colors',
            isCorrect
              ? 'bg-[var(--success)] text-[var(--success-foreground)] border-transparent'
              : isWrong
              ? 'bg-[var(--destructive)] text-[var(--destructive-foreground)] border-transparent'
              : isSelected
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent'
              : 'bg-[var(--secondary)] text-[var(--muted-foreground)] border-[var(--glass-border)]'
          )}
        >
          {letter}
        </div>

        <span className="font-semibold text-base sm:text-lg truncate tracking-tight text-[var(--foreground)]">
          {option}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Status icons on reveal */}
        {isCorrect && (
          <CheckCircle size={24} weight="fill" className="text-[var(--success)]" />
        )}
        {isWrong && (
          <XCircle size={24} weight="fill" className="text-[var(--destructive)]" />
        )}

        {/* Other players who guessed this */}
        {guessers.length > 0 && (
          <div className="flex -space-x-2 shrink-0" aria-label={`${guessers.length} players selected this`}>
            {guessers.slice(0, 4).map((guess) => {
              const player = playersById.get(guess.playerId);
              if (!player) return null;
              return (
                <div key={guess.playerId} title={player.username}>
                  <Avatar
                    src={player.avatar}
                    alt={player.username}
                    fallback={player.username[0]?.toUpperCase() || '?'}
                    size="sm"
                    className="ring-2 ring-[var(--background)] shadow-sm"
                  />
                </div>
              );
            })}
            {guessers.length > 4 && (
              <span className="w-7 h-7 rounded-full bg-[var(--secondary)] text-[11px] font-bold flex items-center justify-center ring-2 ring-[var(--background)] text-[var(--muted-foreground)]">
                +{guessers.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.button>
  );
}
