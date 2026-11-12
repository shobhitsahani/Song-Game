'use client';

import { memo, useMemo } from 'react';
import { Trophy, Medal } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import type { Player } from '@song-game/types';

interface ScoreboardProps {
  players: Player[];
  currentPlayerId?: string | null;
  isSurvival?: boolean;
}

function RankBadge({ rank }: { rank: number }) {
  switch (rank) {
    case 1:
      return (
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
          <Trophy size={16} weight="fill" />
        </div>
      );
    case 2:
      return (
        <div className="w-7 h-7 rounded-lg bg-zinc-400/20 text-zinc-300 flex items-center justify-center shrink-0 border border-zinc-400/30">
          <Medal size={16} weight="fill" />
        </div>
      );
    case 3:
      return (
        <div className="w-7 h-7 rounded-lg bg-amber-700/20 text-amber-600 flex items-center justify-center shrink-0 border border-amber-700/30">
          <Medal size={16} weight="fill" />
        </div>
      );
    default:
      return (
        <span className="w-7 h-7 rounded-lg bg-[var(--secondary)] text-[var(--muted-foreground)] flex items-center justify-center text-xs font-mono font-semibold shrink-0">
          #{rank}
        </span>
      );
  }
}

const PlayerRow = memo(function PlayerRow({
  player,
  isCurrentUser,
}: {
  player: Player;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 border',
        isCurrentUser
          ? 'liquid-glass-surface bg-[var(--primary)]/10 border-[var(--primary)]/40 shadow-sm'
          : 'bg-[var(--glass-bg)] border-[var(--glass-border)]'
      )}
    >
      <RankBadge rank={player.rank} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate text-[var(--foreground)]">
          {player.username}
          {isCurrentUser && (
            <span className="text-[var(--primary)] text-xs ml-1 font-normal">(you)</span>
          )}
        </p>
        <p className="text-xs font-mono text-[var(--muted-foreground)]">
          {player.score.toLocaleString()} pts
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold font-mono text-[var(--foreground)]">
          {player.correctAnswers}/{player.totalAnswers}
        </p>
        {player.avgResponseTime !== undefined && (
          <p className="text-[11px] font-mono text-[var(--muted-foreground)]">
            {player.avgResponseTime.toFixed(1)}s
          </p>
        )}
      </div>
    </div>
  );
});

export const Scoreboard = memo(function Scoreboard({
  players,
  currentPlayerId,
  isSurvival,
}: ScoreboardProps) {
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
    return (
      <p className="text-xs text-[var(--muted-foreground)] text-center py-4">
        Waiting for players...
      </p>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
      {sortedPlayers.map((player, index) => (
        <PlayerRow
          key={player.id}
          player={{ ...player, rank: index + 1 }}
          isCurrentUser={player.id === currentPlayerId}
        />
      ))}
    </div>
  );
});
