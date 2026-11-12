'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameScreen } from '@/components/game/game-screen';
import { GameResults } from '@/components/game/game-results';
import type { Player, RoundPayload, GuessResultPayload } from '@song-game/types';
import React, { Suspense } from 'react';

const MOCK_PLAYERS: Player[] = [
  {
    id: 'p1',
    username: 'VinylMaster',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    score: 3450,
    correctAnswers: 8,
    totalAnswers: 10,
    avgResponseTime: 2.4,
    rank: 1,
    isHost: true,
    isReady: true,
    isSpectator: false,
    isAlive: true,
    hasGuessed: true,
    socketId: 's1',
    roundPoints: 450,
    guessTime: 2.1,
  },
  {
    id: 'p2',
    username: 'GrooveQueen',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    score: 2890,
    correctAnswers: 7,
    totalAnswers: 10,
    avgResponseTime: 3.1,
    rank: 2,
    isHost: false,
    isReady: true,
    isSpectator: false,
    isAlive: true,
    hasGuessed: true,
    socketId: 's2',
    roundPoints: 380,
    guessTime: 3.0,
  },
  {
    id: 'p3',
    username: 'BeatDropper',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    score: 2100,
    correctAnswers: 5,
    totalAnswers: 10,
    avgResponseTime: 3.8,
    rank: 3,
    isHost: false,
    isReady: true,
    isSpectator: false,
    isAlive: true,
    hasGuessed: true,
    socketId: 's3',
    roundPoints: 0,
    guessTime: 4.2,
  },
];

const OPTIONS = [
  'Midnight City - M83',
  'Wait - M83',
  'Intro - The xx',
  'Genesis - Grimes',
];

const MOCK_ROUND: RoundPayload = {
  roundNumber: 4,
  totalRounds: 10,
  mode: 'CLASSIC',
  duration: 15,
  previewUrl: '',
  songTitle: 'Midnight City',
  artist: 'M83',
  albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
  options: OPTIONS,
};

function PreviewContent() {
  const searchParams = useSearchParams();
  const state = searchParams.get('state') || 'question'; // 'question' | 'correct' | 'wrong' | 'results'
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    state === 'correct' ? OPTIONS[0] : state === 'wrong' ? OPTIONS[1] : null
  );

  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isReveal = isCorrect || isWrong;

  const revealData: GuessResultPayload | null = isReveal
    ? {
        wasCorrect: isCorrect,
        correctAnswer: OPTIONS[0],
        points: isCorrect ? 450 : 0,
        basePoints: isCorrect ? 300 : 0,
        speedBonus: isCorrect ? 150 : 0,
        speedTier: 'LIGHTNING',
        correctIndex: 0,
        responseTime: 2.1,
      }
    : null;

  if (state === 'results') {
    return (
      <main className="min-h-screen p-4">
        <GameResults
          players={MOCK_PLAYERS}
          currentPlayerId="p1"
          onPlayAgain={() => {}}
          onBackToLobby={() => {}}
          onLeave={() => {}}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-28 px-4">
      <GameScreen
        mode="CLASSIC"
        currentRound={MOCK_ROUND}
        roundNumber={4}
        totalRounds={10}
        timeLeft={isReveal ? 0 : 9}
        gameStatus={isReveal ? 'REVEAL' : 'PLAYING'}
        revealData={revealData}
        players={MOCK_PLAYERS}
        currentPlayerId="p1"
        options={OPTIONS}
        selectedAnswer={selectedAnswer}
        correctIndex={isReveal ? 0 : null}
        playerGuesses={
          isReveal
            ? [
                {
                  playerId: 'p1',
                  option: isCorrect ? OPTIONS[0] : OPTIONS[1],
                },
              ]
            : []
        }
        onSubmitAnswer={(ans) => setSelectedAnswer(ans)}
      />
    </main>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading preview...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
