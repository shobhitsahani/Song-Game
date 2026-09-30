'use client';

import * as React from 'react';
import {
  motion, AnimatePresence, useInView, stagger, useAnimate,
} from 'framer-motion';
import {
  Trophy, Gamepad2, Target, Zap, Flame, AudioLines, Clock, TrendingUp,
  Settings, Users, ListMusic, Medal, ChevronUp, ChevronDown,
  Copy, Check, Crown, Sparkles, Lock, Trash2, Bell, BellOff,
  UserPlus, Search, ExternalLink, Palette, Image as ImageIcon, TriangleAlert,
  X, Share2, Star, ChevronRight, Calendar,
} from 'lucide-react';
import { cn, formatTime, formatXp, getLevelProgress, getInitials } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useFriendStore } from '@/store/friends';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs';
import { Skeleton, ProfileSkeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { XpBar } from '@/components/shared/xp-bar';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { GameModeBadge } from '@/components/shared/game-mode-badge';
import type {
  User, Achievement, MatchHistory, XPInfo, GameMode,
  DeezerPlaylist, Friend, LeaderboardEntry,
} from '@/types';

function useCountUp(end: number, duration = 1500, start = 0) {
  const [value, setValue] = React.useState(start);
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end, duration, start]);

  return { value, ref };
}

function StatCard({
  icon: Icon, label, value, suffix = '', color = 'text-violet-400',
}: {
  icon: React.ElementType; label: string; value: number; suffix?: string; color?: string;
}) {
  const { value: count, ref } = useCountUp(value);
  return (
    <Card className="p-4 sm:p-5" ref={ref as React.Ref<HTMLDivElement>}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
          <motion.p
            className="text-2xl sm:text-3xl font-bold tabular-nums"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {count}{suffix}
          </motion.p>
        </div>
        <div className={cn('rounded-lg p-2.5 bg-opacity-20', color.replace('text-', 'bg-').replace('400', '500/15'))}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
      </div>
    </Card>
  );
}

function RankCard({
  label, rank, change, total,
}: {
  label: string; rank: number; change?: number; total?: number;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/30">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">#{rank}{total ? ` / ${total}` : ''}</span>
        {change !== undefined && change !== 0 && (
          <span className={cn('flex items-center text-xs font-medium', change > 0 ? 'text-green-400' : 'text-red-400')}>
            {change > 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {Math.abs(change)}
          </span>
        )}
      </div>
    </div>
  );
}

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={cn(
        'relative overflow-hidden p-4 h-full',
        achievement.unlocked && 'border-green-500/30',
      )}>
        {!achievement.unlocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
            <Lock className="h-6 w-6 text-muted-foreground/60" />
          </div>
        )}
        <div className="flex flex-col items-center text-center gap-2">
          <motion.div
            className={cn(
              'text-3xl',
              achievement.unlocked && 'cursor-default',
            )}
            whileHover={achievement.unlocked ? { scale: 1.15, rotate: [0, -10, 10, -5, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            {achievement.icon}
          </motion.div>
          <h4 className="text-sm font-semibold">{achievement.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
          <Badge variant="warning" size="sm">+{achievement.xpReward} XP</Badge>
          {achievement.unlocked && achievement.unlockedAt && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        {achievement.unlocked && (
          <motion.div
            className="absolute -top-6 -right-6 w-12 h-12 bg-green-500/20 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <Check className="absolute top-8 right-8 h-3.5 w-3.5 text-green-400" />
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

function MatchCard({ match, index }: { match: MatchHistory; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className="p-4 mb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <GameModeBadge mode={match.mode} size="sm" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                {new Date(match.date).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
              <p className="text-sm font-medium">
                {match.correctAnswers}/{match.totalQuestions} correct
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-sm font-bold">{match.score.toLocaleString()}</p>
              <Badge variant={match.rank <= 3 ? 'success' : 'secondary'} size="sm">
                #{match.rank} of {match.totalPlayers}
              </Badge>
            </div>
            <div className="text-right min-w-[60px]">
              <p className="text-sm text-green-400 font-medium">+{match.xpEarned} XP</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function FriendRow({ friend, onRemove }: { friend: Friend; onRemove: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/40 transition-colors group"
    >
      <div className="relative">
        <Avatar size="md">
          <AvatarImage src={friend.avatar} alt={friend.username} />
          <AvatarFallback>{getInitials(friend.username)}</AvatarFallback>
        </Avatar>
        <span className={cn(
          'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background',
          friend.isOnline ? 'bg-green-500' : 'bg-gray-500',
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{friend.username}</p>
        <p className="text-xs text-muted-foreground">
          Level {friend.level} &middot; {formatXp(friend.xp)} XP
        </p>
      </div>
      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

function PlaylistCard({ playlist, onRemove }: { playlist: DeezerPlaylist; onRemove: () => void }) {
  return (
    <Card className="p-3 group">
      <div className="relative mb-2">
        <div className="aspect-square rounded-lg bg-secondary overflow-hidden">
          {playlist.image ? (
            <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <AudioLines className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
          onClick={onRemove}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="text-sm font-medium truncate">{playlist.name}</p>
      <p className="text-xs text-muted-foreground truncate">{playlist.ownerName}</p>
    </Card>
  );
}

function XPTransaction({ tx, index }: { tx: { amount: number; reason: string; date: string }; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className={cn(
          'h-2 w-2 rounded-full',
          tx.amount > 0 ? 'bg-green-500' : 'bg-red-500',
        )} />
        <div>
          <p className="text-sm">{tx.reason}</p>
          <p className="text-[11px] text-muted-foreground">
            {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>
      <span className={cn(
        'text-sm font-semibold tabular-nums',
        tx.amount > 0 ? 'text-green-400' : 'text-red-400',
      )}>
        {tx.amount > 0 ? '+' : ''}{tx.amount} XP
      </span>
    </motion.div>
  );
}

function NotificationSection({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
};

// Mock data for development
const mockAchievements: Achievement[] = [
  { id: '1', type: 'WINS', title: 'First Victory', description: 'Win your first game', icon: '🏆', rarity: 'COMMON', xpReward: 100, unlocked: true, unlockedAt: '2025-06-15T10:30:00Z' },
  { id: '2', type: 'STREAK', title: 'On Fire', description: 'Win 5 games in a row', icon: '🔥', rarity: 'RARE', xpReward: 500, unlocked: true, unlockedAt: '2025-07-01T14:20:00Z' },
  { id: '3', type: 'ACCURACY', title: 'Sharpshooter', description: 'Achieve 100% accuracy in a game', icon: '🎯', rarity: 'EPIC', xpReward: 1000, unlocked: true, unlockedAt: '2025-07-10T09:15:00Z' },
  { id: '4', type: 'SPEED', title: 'Lightning Round', description: 'Answer in under 2 seconds', icon: '⚡', rarity: 'RARE', xpReward: 750, unlocked: false },
  { id: '5', type: 'LEVEL', title: 'Centurion', description: 'Reach level 100', icon: '💯', rarity: 'LEGENDARY', xpReward: 5000, unlocked: false },
  { id: '6', type: 'SOCIAL', title: 'Party Host', description: 'Host 10 games with friends', icon: '🎉', rarity: 'COMMON', xpReward: 200, unlocked: true, unlockedAt: '2025-06-20T18:00:00Z' },
  { id: '7', type: 'DIVERSITY', title: 'Genre Explorer', description: 'Play all game modes', icon: '🎵', rarity: 'RARE', xpReward: 300, unlocked: false },
  { id: '8', type: 'PERSISTENCE', title: 'Dedicated', description: 'Play 100 games', icon: '🎮', rarity: 'EPIC', xpReward: 2000, unlocked: true, unlockedAt: '2025-07-05T11:45:00Z' },
];

const mockMatches: MatchHistory[] = [
  { id: '1', gameId: 'g1', roomCode: 'ABC123', mode: 'CLASSIC', date: '2025-07-28T19:30:00Z', rank: 1, totalPlayers: 6, score: 2850, xpEarned: 250, correctAnswers: 8, totalQuestions: 10 },
  { id: '2', gameId: 'g2', roomCode: 'DEF456', mode: 'ARTIST', date: '2025-07-27T20:15:00Z', rank: 2, totalPlayers: 4, score: 1900, xpEarned: 150, correctAnswers: 6, totalQuestions: 10 },
  { id: '3', gameId: 'g3', roomCode: 'GHI789', mode: 'SURVIVAL', date: '2025-07-26T18:00:00Z', rank: 3, totalPlayers: 8, score: 1200, xpEarned: 100, correctAnswers: 4, totalQuestions: 8 },
  { id: '4', gameId: 'g4', roomCode: 'JKL012', mode: 'HARDCORE', date: '2025-07-25T21:00:00Z', rank: 1, totalPlayers: 5, score: 3200, xpEarned: 300, correctAnswers: 9, totalQuestions: 10 },
  { id: '5', gameId: 'g5', roomCode: 'MNO345', mode: 'PARTY', date: '2025-07-24T22:30:00Z', rank: 4, totalPlayers: 10, score: 800, xpEarned: 50, correctAnswers: 3, totalQuestions: 10 },
  { id: '6', gameId: 'g6', roomCode: 'PQR678', mode: 'LYRICS', date: '2025-07-23T17:45:00Z', rank: 2, totalPlayers: 5, score: 2100, xpEarned: 175, correctAnswers: 7, totalQuestions: 10 },
  { id: '7', gameId: 'g7', roomCode: 'STU901', mode: 'GENRE', date: '2025-07-22T19:00:00Z', rank: 1, totalPlayers: 3, score: 1500, xpEarned: 200, correctAnswers: 5, totalQuestions: 5 },
  { id: '8', gameId: 'g8', roomCode: 'VWX234', mode: 'DECADE', date: '2025-07-21T20:30:00Z', rank: 3, totalPlayers: 6, score: 1100, xpEarned: 80, correctAnswers: 4, totalQuestions: 8 },
];

const mockPlaylists: DeezerPlaylist[] = [
  { id: 'p1', name: '90s Rock Anthems', description: '', image: '', ownerName: 'You', trackCount: 45 },
  { id: 'p2', name: 'Summer Vibes 2025', description: '', image: '', ownerName: 'You', trackCount: 32 },
  { id: 'p3', name: 'Chill Electronic', description: '', image: '', ownerName: 'Deezer User', trackCount: 67 },
];

const mockFriends: Friend[] = [
  { id: 'f1', userId: 'u1', username: 'MusicMaster99', avatar: '', xp: 45200, level: 42, isOnline: true, lastSeen: '', since: '2025-01-15T10:00:00Z' },
  { id: 'f2', userId: 'u2', username: 'TriviaQueen', avatar: '', xp: 38900, level: 38, isOnline: true, lastSeen: '', since: '2025-02-20T14:30:00Z' },
  { id: 'f3', userId: 'u3', username: 'JazzHands', avatar: '', xp: 21500, level: 28, isOnline: false, lastSeen: '2025-07-28T08:15:00Z', since: '2025-03-10T09:00:00Z' },
  { id: 'f4', userId: 'u4', username: 'RockStar2025', avatar: '', xp: 56700, level: 47, isOnline: false, lastSeen: '2025-07-27T22:00:00Z', since: '2025-04-05T16:45:00Z' },
  { id: 'f5', userId: 'u5', username: 'BeatDetective', avatar: '', xp: 12400, level: 21, isOnline: true, lastSeen: '', since: '2025-05-12T11:30:00Z' },
];

const mockXpHistory = [
  { amount: 250, reason: 'Match win - Classic mode', date: '2025-07-28T19:35:00Z' },
  { amount: 150, reason: '2nd place - Artist mode', date: '2025-07-27T20:20:00Z' },
  { amount: 100, reason: '3rd place - Survival mode', date: '2025-07-26T18:05:00Z' },
  { amount: 300, reason: 'Match win - Hardcore mode', date: '2025-07-25T21:05:00Z' },
  { amount: 50, reason: 'Participation - Party mode', date: '2025-07-24T22:35:00Z' },
  { amount: 175, reason: '2nd place - Lyrics mode', date: '2025-07-23T17:50:00Z' },
  { amount: 200, reason: 'Match win - Genre mode', date: '2025-07-22T19:05:00Z' },
  { amount: 80, reason: '3rd place - Decade mode', date: '2025-07-21T20:35:00Z' },
  { amount: 500, reason: 'Achievement: On Fire', date: '2025-07-01T14:25:00Z' },
  { amount: 1000, reason: 'Achievement: Sharpshooter', date: '2025-07-10T09:20:00Z' },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, id: 'lb1', username: 'SongKing', avatar: '', xp: 120000, level: 99, title: 'Music Legend', border: 'premium', score: 120000 },
  { rank: 2, id: 'lb2', username: 'TriviaQueen', avatar: '', xp: 98500, level: 88, title: 'Virtuoso', border: 'premium', score: 98500 },
  { rank: 3, id: 'lb3', username: 'NoteMaster', avatar: '', xp: 81200, level: 79, title: 'Maestro', score: 81200 },
  { rank: 156, id: 'u_current', username: 'Player', avatar: '', xp: 32500, level: 35, title: 'Melody Maker', score: 32500 },
];

const titleColors: Record<string, string> = {
  'Music Legend': 'from-yellow-400 to-orange-400',
  Virtuoso: 'from-gold to-ember',
  Maestro: 'from-blue-400 to-cyan-400',
  'Melody Maker': 'from-green-400 to-emerald-400',
  Rookie: 'from-gray-400 to-gray-300',
};

export default function ProfilePage() {
  const { user: authUser, isLoading: authLoading } = useAuthStore();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [friendSearch, setFriendSearch] = React.useState('');

  // Settings state
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [notifications, setNotifications] = React.useState({
    friendOnline: true,
    invites: true,
    achievements: true,
    matchReminders: false,
  });

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // In production, also call API to get full profile data
        // For now, use auth user + mock data
        if (authUser) {
          const profile: User = {
            id: authUser.id || 'u_current',
            deezerId: authUser.deezerId || '',
            username: authUser.username || 'Player',
            email: authUser.email || '',
            avatar: authUser.avatar || '',
            xp: authUser.xp ?? 32500,
            level: authUser.level ?? 35,
            title: authUser.title || 'Melody Maker',
            border: authUser.border || undefined,
            wins: authUser.wins ?? 127,
            totalGames: authUser.totalGames ?? 342,
            accuracy: authUser.accuracy ?? 78.5,
            fastestAnswer: authUser.fastestAnswer ?? 1.8,
            winStreak: authUser.winStreak ?? 5,
            longestWinStreak: authUser.longestWinStreak ?? 12,
            isOnline: true,
            createdAt: authUser.createdAt || '2025-01-01T00:00:00Z',
          };
          setUser(profile);
          setUsername(profile.username);
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) load();
  }, [authUser, authLoading]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!', 'Profile link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved', 'Your changes have been updated');
    setEditModalOpen(false);
  };

  const handleDeleteAccount = () => {
    setDeleteConfirmOpen(false);
    toast.warning('Account deleted', 'This is a demo action');
  };

  const levelInfo = user ? getLevelProgress(user.xp) : null;
  const favouriteGenres: GameMode[] = (user as any)?.favoriteGenres || ['CLASSIC', 'ARTIST', 'LYRICS', 'DECADE'];
  const userBadges = [
    ...(user?.title ? [{ name: user.title, icon: '👑', tier: 'legendary' }] : []),
    ...(user?.border ? [{ name: `${user.border} border`, icon: '🖼️', tier: user.border }] : []),
    { name: `Level ${user?.level ?? 0}`, icon: '⭐', tier: (user?.level ?? 0) >= 50 ? 'legendary' : (user?.level ?? 0) >= 25 ? 'epic' : (user?.level ?? 0) >= 10 ? 'rare' : 'common' },
  ];
  const filteredFriends = mockFriends.filter(f =>
    f.username.toLowerCase().includes(friendSearch.toLowerCase()),
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <ProfileSkeleton />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
        <Skeleton variant="rect" className="h-64" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorState
          title="Profile Error"
          message={error || 'Could not load profile'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Profile Hero */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-ember/10 pointer-events-none" />
          <motion.div
            className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -30, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <motion.div variants={itemVariants} className="relative">
                <Avatar size="xl" premium={!!user.border}>
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="text-2xl">{getInitials(user.username)}</AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
                )}
              </motion.div>

              <div className="flex-1 text-center sm:text-left space-y-3 min-w-0">
                <motion.div variants={itemVariants}>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{user.username}</h1>
                  {user.title && (
                    <div className={cn(
                      'inline-block mt-1 text-sm font-semibold bg-gradient-to-r bg-clip-text text-transparent',
                      titleColors[user.title] || 'from-gold to-ember',
                    )}>
                      <Sparkles className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                      {user.title}
                    </div>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="max-w-md mx-auto sm:mx-0">
                  <XpBar xp={user.xp} showLabel size="md" />
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                    {user.wins} wins
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                    {user.winStreak} streak
                  </span>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                  <Button variant="glass" size="sm" onClick={() => setEditModalOpen(true)}>
                    <Settings className="h-4 w-4 mr-1.5" />
                    Edit Profile
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopyLink}>
                    {copied ? (
                      <><Check className="h-4 w-4 mr-1.5 text-green-400" />Copied</>
                    ) : (
                      <><Copy className="h-4 w-4 mr-1.5" />Copy Link</>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left column - Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Overview */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
            >
              <StatCard icon={Trophy} label="Total Wins" value={user.wins} color="text-yellow-400" />
              <StatCard icon={Gamepad2} label="Games Played" value={user.totalGames} color="text-blue-400" />
              <StatCard icon={Target} label="Accuracy" value={user.accuracy} suffix="%" color="text-green-400" />
              <StatCard icon={Zap} label="Fastest" value={user.fastestAnswer} suffix="s" color="text-violet-400" />
              <StatCard icon={Flame} label="Best Streak" value={user.longestWinStreak} color="text-orange-400" />
            </motion.div>

            {/* Tabs Section */}
            <Card className="overflow-hidden">
              <Tabs defaultValue="overview">
                <div className="px-4 pt-4 overflow-x-auto">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                    <TabsTrigger value="match-history">Match History</TabsTrigger>
                    <TabsTrigger value="playlists">Playlists</TabsTrigger>
                    <TabsTrigger value="friends">Friends</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                </div>

                <AnimatePresence mode="wait">
                  {/* Tab 1: Overview */}
                  <TabsContent value="overview">
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 space-y-6"
                    >
                      {/* XP History */}
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent XP History</h3>
                        <div className="space-y-1">
                          {mockXpHistory.map((tx, i) => (
                            <XPTransaction key={i} tx={tx} index={i} />
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Level Progress & Perks */}
                      {levelInfo && (
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Card className="p-4 border-border/50">
                            <h4 className="text-sm font-medium mb-2">Level Progress</h4>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Level {levelInfo.level}</span>
                              <span className="text-muted-foreground">{formatXp(levelInfo.currentXp)} / {formatXp(levelInfo.nextLevelXp)} XP</span>
                            </div>
                            <Progress value={levelInfo.progress * 100} color="default" className="mb-2" />
                            <p className="text-xs text-muted-foreground">
                              {Math.round((1 - levelInfo.progress) * levelInfo.nextLevelXp).toLocaleString()} XP until Level {levelInfo.level + 1}
                            </p>
                          </Card>

                          <Card className="p-4 border-border/50">
                            <h4 className="text-sm font-medium mb-2">Level {levelInfo.level} Perks</h4>
                            <ul className="space-y-1.5 text-sm">
                              <li className="flex items-center gap-2 text-muted-foreground">
                                <Crown className="h-3.5 w-3.5 text-yellow-400" />
                                2x XP boost on wins
                              </li>
                              <li className="flex items-center gap-2 text-muted-foreground">
                                <Star className="h-3.5 w-3.5 text-violet-400" />
                                Exclusive title unlock
                              </li>
                              <li className="flex items-center gap-2 text-muted-foreground">
                                <Palette className="h-3.5 w-3.5 text-pink-400" />
                                Premium avatar border
                              </li>
                            </ul>
                          </Card>
                        </div>
                      )}

                      <Separator />

                      {/* Badges */}
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Badges</h3>
                        <div className="flex flex-wrap gap-2">
                          {userBadges.map((badge, i) => (
                            <motion.div
                              key={badge.name}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border',
                                badge.tier === 'legendary' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                badge.tier === 'epic' ? 'bg-violet-500/10 border-gold/30 text-violet-400' :
                                badge.tier === 'rare' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                'bg-white/5 border-white/10 text-muted-foreground',
                              )}
                            >
                              <span>{badge.icon}</span>
                              <span>{badge.name}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Favourite Genres */}
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Favourite Genres</h3>
                        <div className="flex flex-wrap gap-2">
                          {favouriteGenres.map(mode => (
                            <GameModeBadge key={mode} mode={mode} />
                          ))}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Total XP Earned: </span>
                        <span className="text-green-400 font-semibold">{formatXp(user.xp)} XP</span>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Tab 2: Achievements */}
                  <TabsContent value="achievements">
                    <motion.div
                      key="achievements"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {mockAchievements.map((ach, i) => (
                          <AchievementCard key={ach.id} achievement={ach} index={i} />
                        ))}
                      </div>
                      {mockAchievements.filter(a => !a.unlocked).length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm text-muted-foreground mb-2">In Progress</h4>
                          {mockAchievements.filter(a => !a.unlocked).map((ach, i) => (
                            <div key={ach.id} className="flex items-center gap-3 py-2">
                              <span className="text-xl">{ach.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{ach.title}</p>
                                <p className="text-xs text-muted-foreground">{ach.description}</p>
                                <Progress value={Math.random() * 80 + 10} color="warning" className="mt-1" barClassName="h-1.5" />
                              </div>
                              <Badge variant="warning" size="sm">+{ach.xpReward}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </TabsContent>

                  {/* Tab 3: Match History */}
                  <TabsContent value="match-history">
                    <motion.div
                      key="match-history"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4"
                    >
                      <ScrollArea className="h-[500px] pr-2">
                        {mockMatches.length > 0 ? (
                          mockMatches.map((match, i) => (
                            <MatchCard key={match.id} match={match} index={i} />
                          ))
                        ) : (
                          <EmptyState
                            icon={Gamepad2}
                            title="No matches yet"
                            description="Play your first game to see match history here"
                          />
                        )}
                      </ScrollArea>
                    </motion.div>
                  </TabsContent>

                  {/* Tab 4: Playlists */}
                  <TabsContent value="playlists">
                    <motion.div
                      key="playlists"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4"
                    >
                      {mockPlaylists.length > 0 ? (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {mockPlaylists.map((pl, i) => (
                              <PlaylistCard
                                key={pl.id}
                                playlist={pl}
                                onRemove={() => toast.info('Removed', `${pl.name} removed`)}
                              />
                            ))}
                          </div>
                          <div className="mt-4">
                            <Button variant="outline" size="sm" className="gap-2">
                              <ExternalLink className="h-4 w-4" />
                              Import from Deezer
                            </Button>
                          </div>
                        </>
                      ) : (
                        <EmptyState
                          icon={ListMusic}
                          title="No playlists yet"
                          description="Import your Deezer playlists to play with your favourite songs"
                          actionLabel="Import from Deezer"
                        />
                      )}
                    </motion.div>
                  </TabsContent>

                  {/* Tab 5: Friends */}
                  <TabsContent value="friends">
                    <motion.div
                      key="friends"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4"
                    >
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search friends..."
                          value={friendSearch}
                          onChange={(e) => setFriendSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <ScrollArea className="h-[450px] pr-2">
                        {filteredFriends.length > 0 ? (
                          <div className="space-y-1">
                            {filteredFriends.map(f => (
                              <FriendRow
                                key={f.id}
                                friend={f}
                                onRemove={() => toast.info('Friend removed', `${f.username} has been removed`)}
                              />
                            ))}
                          </div>
                        ) : (
                          <EmptyState
                            icon={Users}
                            title={friendSearch ? 'No friends found' : 'No friends yet'}
                            description={friendSearch ? 'Try a different search term' : 'Add friends to play together'}
                          />
                        )}
                      </ScrollArea>
                    </motion.div>
                  </TabsContent>

                  {/* Tab 6: Settings */}
                  <TabsContent value="settings">
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 space-y-6"
                    >
                      {/* Change Username */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Username</h4>
                        <div className="flex gap-2">
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="flex-1"
                          />
                          <Button variant="secondary" size="sm" onClick={() => toast.success('Username updated')}>Save</Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Change Avatar */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">Avatar</h4>
                        <div className="flex items-center gap-4">
                          <Avatar size="lg">
                            <AvatarImage src={user.avatar} alt={user.username} />
                            <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                          </Avatar>
<Button variant="outline" size="sm" className="gap-2">
                                <ImageIcon className="h-4 w-4" /> Change Avatar
                              </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Notification Preferences */}
                      <div>
                        <h4 className="text-sm font-medium mb-1">Notifications</h4>
                        <p className="text-xs text-muted-foreground mb-4">Choose what notifications you receive</p>
                        <div className="space-y-1">
                          <NotificationSection
                            label="Friend Online"
                            description="Get notified when friends come online"
                            checked={notifications.friendOnline}
                            onChange={(v) => setNotifications(prev => ({ ...prev, friendOnline: v }))}
                          />
                          <NotificationSection
                            label="Game Invites"
                            description="Receive game invites from friends"
                            checked={notifications.invites}
                            onChange={(v) => setNotifications(prev => ({ ...prev, invites: v }))}
                          />
                          <NotificationSection
                            label="Achievements"
                            description="Notifications when you earn achievements"
                            checked={notifications.achievements}
                            onChange={(v) => setNotifications(prev => ({ ...prev, achievements: v }))}
                          />
                          <NotificationSection
                            label="Match Reminders"
                            description="Reminders for upcoming scheduled matches"
                            checked={notifications.matchReminders}
                            onChange={(v) => setNotifications(prev => ({ ...prev, matchReminders: v }))}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Save & Danger Zone */}
                      <div className="flex items-center justify-between">
                        <Button variant="gradient" onClick={handleSaveSettings}>
                          Save Changes
                        </Button>
                        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="gap-2">
                              <Trash2 className="h-4 w-4" />
                              Delete Account
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-destructive">
                                <TriangleAlert className="h-5 w-5" />
                                Delete Account
                              </DialogTitle>
                              <DialogDescription>
                                This action is permanent and cannot be undone. All your data, including stats, achievements, and match history will be deleted.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
                              <p className="font-medium text-destructive">Are you absolutely sure?</p>
                              <p className="text-muted-foreground mt-1">
                                Type <strong className="text-foreground">delete my account</strong> below to confirm.
                              </p>
                            </div>
                            <DialogFooter className="gap-2">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button variant="destructive" onClick={handleDeleteAccount}>
                                Delete My Account
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </Card>
          </div>

          {/* Right column - Leaderboard Sidebar */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-5">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-violet-400" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-1">
                  <RankCard label="Global" rank={156} change={-3} total={12450} />
                  <RankCard label="Friends" rank={4} change={1} total={25} />
                  <RankCard label="Weekly" rank={42} change={12} total={8450} />
                  <RankCard label="Monthly" rank={38} change={-5} total={9200} />
                </CardContent>
                <Button variant="ghost" size="sm" className="w-full mt-4 gap-1 text-muted-foreground" asChild>
                  <a href="/leaderboard">
                    View Full Leaderboard
                    <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </Card>
            </motion.div>

            {/* Top 3 players mini card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4">
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-400" />
                    Top Players
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                  {mockLeaderboard.slice(0, 3).map((entry, i) => (
                    <div key={entry.id} className="flex items-center gap-2">
                      <span className={cn(
                        'w-5 text-xs font-bold text-center',
                        i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : 'text-orange-400',
                      )}>
                        {i + 1}
                      </span>
                      <Avatar size="sm">
                        <AvatarImage src={entry.avatar} alt={entry.username} />
                        <AvatarFallback className="text-[10px]">{getInitials(entry.username)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{entry.username}</p>
                        <p className="text-[10px] text-muted-foreground">{formatXp(entry.xp)} XP</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Recent Achievements Toast */}
        <AnimatePresence>
          {user.title && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
            >
              <Card className="p-3 shadow-xl border-gold/30 bg-card/90 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xl"
                  >
                    🎉
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium">New Achievement!</p>
                    <p className="text-xs text-muted-foreground">First Victory unlocked</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-2">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Profile Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your profile information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <Avatar size="xl">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="text-xl">{getInitials(user.username)}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Change Photo
                </Button>
              </div>
              <Input
                label="Display Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                label="Title"
                value={user.title || ''}
                disabled
                wrapperClassName="opacity-60"
              />
              <div>
                <label className="text-sm font-medium mb-2 block">Profile Border</label>
                <div className="flex gap-2">
                  {[null, 'gold', 'platinum', 'diamond'].map((b) => (
                    <button
                      key={b || 'none'}
                      onClick={() => handleSaveSettings()}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        b === 'gold' ? 'border-yellow-400 bg-yellow-400/20' :
                        b === 'platinum' ? 'border-cyan-400 bg-cyan-400/20' :
                        b === 'diamond' ? 'border-blue-400 bg-blue-400/20' :
                        'border-border bg-secondary'
                      } ${(user.border || null) === b ? 'ring-2 ring-gold scale-110' : ''}`}
                      title={b || 'None'}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="gradient" onClick={handleSaveSettings}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
