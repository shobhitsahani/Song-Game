'use client';
import * as React from 'react';
import { Music, Mic2, Album, FileText, Tag, Calendar, Skull, Heart, PartyPopper, Puzzle, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const gameModes = {
  classic: { label: 'Classic', icon: Music, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  artist: { label: 'Artist', icon: Mic2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  album: { label: 'Album', icon: Album, color: 'text-green-400 bg-green-500/10 border-green-500/30' },
  lyrics: { label: 'Lyrics', icon: FileText, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  genre: { label: 'Genre', icon: Tag, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  decade: { label: 'Decade', icon: Calendar, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  hardcore: { label: 'Hardcore', icon: Skull, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  survival: { label: 'Survival', icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  party: { label: 'Party', icon: PartyPopper, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  custom: { label: 'Custom', icon: Puzzle, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
} as const;

export interface GameModeBadgeProps {
  mode: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function GameModeBadge({ mode, showIcon = true, className }: GameModeBadgeProps) {
  const gm = gameModes[mode.toLowerCase() as keyof typeof gameModes] ?? { label: mode, icon: Puzzle, color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' };
  const Icon = gm.icon;
  return (
    <Badge variant="outline" className={cn('gap-1.5', gm.color, className)}>
      {showIcon && <Icon className="h-3.5 w-3.5" />}{gm.label}
    </Badge>
  );
}
