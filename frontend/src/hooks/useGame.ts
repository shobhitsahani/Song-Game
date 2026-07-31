'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import type { Round, GamePlayer } from '@/types';

export function useGame(socket: Socket | null) {
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'COUNTDOWN' | 'PREVIEW' | 'PLAYING' | 'REVEAL' | 'FINISHED'>('IDLE');
  const [countdown, setCountdown] = useState(0);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [revealData, setRevealData] = useState<{
    correctIndex: number;
    correctAnswer: string;
    points: number;
    basePoints: number;
    speedBonus: number;
    speedTier: string;
    responseTime: number;
    wasCorrect: boolean;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [roundNumber, setRoundNumber] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);

  const handlersRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleCountdown = (seconds: number) => {
      setGameStatus('COUNTDOWN');
      setCountdown(seconds);
      if (seconds === 0) {
        setGameStatus('PREVIEW');
      }
    };

    const handleRoundStart = (data: {
      roundNumber: number;
      totalRounds: number;
      mode: string;
      songTitle?: string;
      artist?: string;
      album?: string;
      albumArt?: string;
      previewUrl?: string;
      options: string[];
      duration: number;
    }) => {
      const round: Round = {
        roundNumber: data.roundNumber,
        totalRounds: data.totalRounds,
        mode: data.mode as any,
        song: {
          albumArt: data.albumArt || '',
          artist: data.artist,
          album: data.album,
          songTitle: data.songTitle,
          previewUrl: data.previewUrl || '',
        },
        options: data.options,
        duration: data.duration,
      };
      setCurrentRound(round);
      setRoundNumber(data.roundNumber);
      setTotalRounds(data.totalRounds);
      setOptions(data.options);
      setGameStatus('PREVIEW');
      setRevealData(null);
      setSelectedAnswer(null);
      setCorrectIndex(null);
      setTimeLeft(0);
    };

    const handleSongPlay = (url: string, duration: number) => {
      setPreviewUrl(url);
      setGameStatus('PLAYING');
    };

    const handleTimerUpdate = (seconds: number) => {
      setTimeLeft(seconds);
    };

    const handleAnswerReveal = (data: {
      correctIndex: number;
      correctAnswer: string;
      points: number;
      basePoints: number;
      speedBonus: number;
      speedTier: string;
      responseTime: number;
      wasCorrect: boolean;
    }) => {
      setRevealData(data);
      setCorrectIndex(data.correctIndex);
      setGameStatus('REVEAL');
      setTimeLeft(0);
    };

    const handleScoreUpdate = (updatedPlayers: GamePlayer[]) => {
      setPlayers(updatedPlayers);
    };

    const handleRoundEnd = (data: { roundNumber: number; players: GamePlayer[]; correctAnswer: string }) => {
      setPlayers(data.players);
      setGameStatus('REVEAL');
      setTimeLeft(0);
    };

    const handleGameEnd = (results: GamePlayer[]) => {
      setPlayers(results);
      setGameStatus('FINISHED');
    };

    socket.on('game:countdown', handleCountdown);
    socket.on('game:round-start', handleRoundStart);
    socket.on('game:audio-play', handleSongPlay);
    socket.on('game:timer-update', handleTimerUpdate);
    socket.on('game:guess-result', handleAnswerReveal);
    socket.on('game:leaderboard', handleScoreUpdate);
    socket.on('game:round-end', handleRoundEnd);
    socket.on('game:end', handleGameEnd);

    handlersRef.current = () => {
      socket.off('game:countdown', handleCountdown);
      socket.off('game:round-start', handleRoundStart);
      socket.off('game:audio-play', handleSongPlay);
      socket.off('game:timer-update', handleTimerUpdate);
      socket.off('game:guess-result', handleAnswerReveal);
      socket.off('game:leaderboard', handleScoreUpdate);
      socket.off('game:round-end', handleRoundEnd);
      socket.off('game:end', handleGameEnd);
    };

    return () => handlersRef.current?.();
  }, [socket]);

  const startGame = useCallback(() => {
    socket?.emit('game:start');
  }, [socket]);

  const submitAnswer = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    socket?.emit('game:guess', answer);
  }, [socket]);

  const resetGame = useCallback(() => {
    setGameStatus('IDLE');
    setCountdown(0);
    setCurrentRound(null);
    setPlayers([]);
    setTimeLeft(0);
    setRevealData(null);
    setPreviewUrl(null);
    setRoundNumber(0);
    setTotalRounds(0);
    setOptions([]);
    setSelectedAnswer(null);
    setCorrectIndex(null);
  }, []);

  return {
    gameStatus,
    countdown,
    currentRound,
    players,
    timeLeft,
    revealData,
    previewUrl,
    roundNumber,
    totalRounds,
    options,
    selectedAnswer,
    correctIndex,
    startGame,
    submitAnswer,
    resetGame,
  };
}
