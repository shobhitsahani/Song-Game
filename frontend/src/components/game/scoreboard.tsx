'use client';

import { memo, useMemo } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import type { GamePlayer } from '@/types';

interface ScoreboardProps {
  players: GamePlayer[];
  currentUserId?: string;
  isSurvival?: boolean;
}

function RankIcon({ rank }: { rank: number }) {
  switch (rank) {
    case 1: return <Trophy className="w-5 h-5 text-yellow-400" />;
    case 2: return <Medal className="w-5 h-5 text-gray-300" />;
    case 3: return <Medal className="w-5 h-5 text-amber-600" />;
    default: return <span className="w-5 h-5 flex items-center justify-center text-sm text-gray-500">#{rank}</span>;
  }
}

const PlayerRow = memo(function PlayerRow({ player, isCurrentUser }: { player: GamePlayer; isCurrentUser: boolean }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
      isCurrentUser ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/5'
    }`}>
      <RankIcon rank={player.rank} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{player.username}</p>
        <p className="text-sm text-gray-400">{player.score} pts</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{player.correctAnswers}/{player.totalAnswers}</p>
        <p className="text-xs text-gray-500">{player.avgResponseTime?.toFixed(1)}s</p>
      </div>
    </div>
  );
});

export const Scoreboard = memo(function Scoreboard({ players, currentUserId, isSurvival }: ScoreboardProps) {
  const sortedPlayers = useMemo(() => {
    if (!players?.length) return [];
    return [...players].sort((a, b) => {
      if (isSurvival && a.isAlive !== b.isAlive) {
        return a.isAlive ? -1 : 1;
      }
      return b.score - a.score;
    });
  }, [players, isSurvival]);

  if (!sortedPlayers.length) {
    return <p className="text-gray-500 text-center py-4">No players yet</p>;
  }

  return (
    <div className="space-y-2">
      {sortedPlayers.map((player, index) => (
        <PlayerRow
          key={player.id}
          player={{ ...player, rank: index + 1 }}
          isCurrentUser={player.userId === currentUserId}
        />
      ))}
    </div>
  );
});
