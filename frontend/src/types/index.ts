export type GameMode = 'CLASSIC' | 'ARTIST' | 'ALBUM' | 'LYRICS' | 'GENRE' | 'DECADE' | 'YEAR' | 'HARDCORE' | 'SURVIVAL' | 'PARTY' | 'CUSTOM';

export interface User {
  id: string;
  deezerId: string;
  username: string;
  email: string;
  avatar: string;
  xp: number;
  level: number;
  title?: string;
  border?: string;
  wins: number;
  totalGames: number;
  accuracy: number;
  fastestAnswer: number;
  winStreak: number;
  longestWinStreak: number;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RoomPlayer {
  id: string;
  userId?: string;
  username: string;
  avatar: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  avgResponseTime: number;
  rank: number;
  isHost: boolean;
  isReady: boolean;
  isSpectator?: boolean;
  isAlive?: boolean;
}

export interface Room {
  code: string;
  host: RoomPlayer;
  players: RoomPlayer[];
  spectators?: RoomPlayer[];
  settings: GameSettings;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  mode: GameMode;
  playerCount: number;
  maxPlayers: number;
  createdAt: string;
}

export interface RoomSettings {
  maxPlayers: number;
  isPrivate: boolean;
  allowSpectators: boolean;
}

export interface Game {
  id: string;
  roomCode: string;
  mode: GameMode;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  settings: GameSettings;
  players: GamePlayer[];
  currentRound: number;
  totalRounds: number;
  createdAt: string;
  endedAt?: string;
}

export interface GameSettings {
  rounds: number;
  guessTime: number;
  category: string;
  difficulty: string;
  playlist?: string;
  isPrivate: boolean;
  maxPlayers: number;
  allowSpectators: boolean;
  mode: GameMode;
}

export interface GamePlayer {
  id: string;
  userId?: string;
  username: string;
  avatar: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  avgResponseTime: number;
  rank: number;
  isHost: boolean;
  isReady: boolean;
  isSpectator?: boolean;
  isAlive?: boolean;
}

export interface Round {
  roundNumber: number;
  totalRounds: number;
  mode?: GameMode;
  song: {
    albumArt: string;
    artist?: string;
    album?: string;
    songTitle?: string;
    previewUrl: string;
  };
  options: string[];
  duration: number;
}

export interface RoundGuess {
  playerId: string;
  username: string;
  isCorrect: boolean;
  points: number;
  responseTime: number;
  guessedAt: number;
}

export interface ChatMessage {
  id: string;
  userId?: string;
  username: string;
  message: string;
  timestamp: number;
  reactions?: Record<string, string[]>;
}

export interface Friend {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  xp: number;
  level: number;
  isOnline: boolean;
  lastSeen?: string;
  since: string;
}

export interface FriendRequest {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  xp: number;
  level: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
  unlocked?: boolean;
  unlockedAt?: string;
}

export interface Notification {
  id: string;
  type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPT' | 'GAME_INVITE' | 'ACHIEVEMENT_UNLOCK' | 'LEVEL_UP' | 'DAILY_CHALLENGE' | 'MATCH_START';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  avatar: string;
  xp: number;
  level: number;
  title?: string;
  border?: string;
  score: number;
  wins?: number;
  accuracy?: number;
  totalGames?: number;
}

export interface DailyChallenge {
  id: string;
  userId: string;
  date: string;
  playlistId: string;
  score: number;
  completed: boolean;
  rewardClaimed: boolean;
}

export interface MatchHistory {
  id: string;
  gameId: string;
  roomCode: string;
  mode: string;
  date: string;
  rank: number;
  totalPlayers: number;
  score: number;
  xpEarned: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface XPInfo {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string; details?: unknown };
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
}

export interface GameStats {
  totalGames: number;
  wins: number;
  winRate: number;
  xp: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
  avgResponseTime: number;
  recentGames: any[];
  achievements: Achievement[];
}

export interface DeezerPlaylist {
  id: string;
  name: string;
  description: string;
  image: string;
  ownerName: string;
  trackCount: number;
}

export const GAME_MODES: { mode: GameMode; label: string; description: string; icon: string }[] = [
  { mode: 'CLASSIC', label: 'Classic', description: 'Guess the song title', icon: '🎵' },
  { mode: 'ARTIST', label: 'Artist Mode', description: 'Guess only the artist', icon: '🎤' },
  { mode: 'ALBUM', label: 'Album Mode', description: 'Guess the album name', icon: '💿' },
  { mode: 'LYRICS', label: 'Lyrics Mode', description: 'Guess the missing lyric', icon: '📝' },
  { mode: 'GENRE', label: 'Genre Mode', description: 'Guess the genre', icon: '🎸' },
  { mode: 'DECADE', label: 'Decade Mode', description: 'Guess the release decade', icon: '📅' },
  { mode: 'YEAR', label: 'Guess Release Year', description: 'Guess the exact release year', icon: '🗓️' },
  { mode: 'HARDCORE', label: 'Hardcore Mode', description: 'No skips, no hints, limited time', icon: '☠️' },
  { mode: 'SURVIVAL', label: 'Survival Mode', description: 'Wrong answer eliminates you', icon: '🛡️' },
  { mode: 'PARTY', label: 'Party Mode', description: 'Unlimited players, fast rounds', icon: '🎉' },
  { mode: 'CUSTOM', label: 'Custom Mode', description: 'Host chooses every setting', icon: '⚙️' },
];
