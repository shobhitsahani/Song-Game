'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Home, RotateCcw, Target, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GamePlayer } from '@/types';
import Link from 'next/link';

interface GameEndScreenProps {
  players: GamePlayer[];
  onPlayAgain: () => void;
}

function ConfettiParticle({ index }: { index: number }) {
  const colors = ['bg-purple-500', 'bg-pink-500', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-red-400', 'bg-indigo-400'];
  const color = colors[index % colors.length];
  const x = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 2 + Math.random() * 3;
  const size = 4 + Math.random() * 8;

  return (
    <motion.div
      className={`absolute ${color} rounded-sm`}
      style={{
        left: `${x}%`,
        top: -10,
        width: size,
        height: size * 0.6,
      }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{
        y: typeof window !== 'undefined' ? window.innerHeight + 50 : 500,
        rotate: 720 + Math.random() * 360,
        opacity: [1, 1, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    />
  );
}

export function GameEndScreen({ players, onPlayAgain }: GameEndScreenProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const getEmoji = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
    >
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </div>
      )}

      <div className="max-w-2xl w-full text-center relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="mb-6 relative"
        >
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </motion.div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold mb-2"
        >
          Game Over!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-muted-foreground mb-8"
        >
          <span className="text-gradient font-bold">{winner?.username}</span> wins the game!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 mb-8"
        >
          {sortedPlayers.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className={`glass rounded-xl p-4 flex items-center gap-4 ${
                i === 0 ? 'ring-2 ring-yellow-500/30' : ''
              }`}
            >
              <span className="text-2xl w-10">{getEmoji(i + 1)}</span>
              <Avatar className="w-10 h-10 ring-2 ring-purple-500/20">
                <AvatarImage src={player.avatar} />
                <AvatarFallback>{player.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{player.username}</p>
                  {i === 0 && <Badge variant="premium" size="sm">Winner</Badge>}
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" />{player.avgResponseTime?.toFixed(1)}s avg</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />{player.correctAnswers}/{player.totalAnswers}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">{player.score}</span>
                <p className="text-[10px] text-muted-foreground">points</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 justify-center"
        >
          <Button size="lg" onClick={onPlayAgain} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Play Again
          </Button>
          <Link href="/">
            <Button size="lg" variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
