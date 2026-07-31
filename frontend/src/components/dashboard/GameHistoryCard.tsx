'use client';

import { motion } from 'framer-motion';
import { Game } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy } from 'lucide-react';

interface GameHistoryCardProps {
  game: Game;
  delay?: number;
}

export function GameHistoryCard({ game, delay = 0 }: GameHistoryCardProps) {
  const isWin = game.players?.[0]?.rank === 1;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="glass rounded-lg p-3 md:p-4 glass-hover flex items-center justify-between"
    >
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {isWin ? (
          <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 shrink-0" />
        ) : (
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] md:text-xs text-muted-foreground shrink-0">
            {game.players?.[0]?.rank || '-'}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-xs md:text-sm truncate">Room {game.roomCode}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
            {new Date(game.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        <Badge variant={isWin ? 'success' : 'secondary'} className="text-[10px] md:text-xs">
          {isWin ? 'Win' : 'Loss'}
        </Badge>
        <span className="text-xs md:text-sm font-bold">{game.players?.[0]?.score || 0}</span>
      </div>
    </motion.div>
  );
}
