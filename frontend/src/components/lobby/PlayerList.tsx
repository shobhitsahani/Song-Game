'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, Clock, X, Ban, Eye, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { GamePlayer } from '@/types';

interface PlayerListProps {
  players: GamePlayer[];
  hostId?: string;
  currentUserId?: string;
  onKick?: (playerId: string) => void;
  onBan?: (playerId: string) => void;
}

export function PlayerList({ players, hostId, currentUserId, onKick, onBan }: PlayerListProps) {
  const playersOnly = players.filter(p => !p.isSpectator);
  const spectators = players.filter(p => p.isSpectator);
  const isHost = currentUserId === hostId;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {playersOnly.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="glass rounded-lg p-3 flex items-center gap-3 glass-hover"
          >
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={player.avatar} />
                <AvatarFallback>{player.username[0]}</AvatarFallback>
              </Avatar>
              {player.id === hostId && (
                <Crown className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {player.username}
                {player.id === hostId && (
                  <span className="text-yellow-400 text-xs ml-1">(Host)</span>
                )}
                {player.id === currentUserId && (
                  <span className="text-purple-400 text-xs ml-1">(You)</span>
                )}
              </p>
            </div>
            {player.isReady ? (
              <Badge variant="success" className="gap-1 shrink-0">
                <Check className="w-3 h-3" />
                Ready
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1 shrink-0">
                <Clock className="w-3 h-3" />
                Waiting
              </Badge>
            )}
            {isHost && player.id !== currentUserId && (
              <Dropdown
                trigger={
                  <Button variant="ghost" size="icon" className="w-7 h-7">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                }
              >
                <button
                  onClick={() => onKick?.(player.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Kick
                </button>
                <button
                  onClick={() => onBan?.(player.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" /> Ban
                </button>
              </Dropdown>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {spectators.length > 0 && (
        <div className="pt-3 border-t border-white/5">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Spectators ({spectators.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {spectators.map(s => (
              <div key={s.id} className="flex items-center gap-1.5 bg-secondary/30 rounded-full px-2.5 py-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={s.avatar} />
                  <AvatarFallback className="text-[8px]">{s.username[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{s.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(PlayerList);
