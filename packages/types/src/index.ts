// ─── User ───────────────────────────────────────────
export interface User {
  id: string;
  email: string | null;
  username: string;
  displayName: string | null;
  avatar: string | null;
  googleId: string | null;
  isGuest: boolean;
  xp: number;
  level: number;
  wins: number;
  totalGames: number;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<User, 'googleId'>;

// ─── Auth ───────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: SafeUser;
  tokens: AuthTokens;
}

export interface JWTPayload {
  userId: string;
  type: 'access' | 'refresh';
}

// ─── Room ───────────────────────────────────────────
export type RoomStatus = 'WAITING' | 'PLAYING' | 'FINISHED';
export type GameMode = 'CLASSIC' | 'ARTIST' | 'ALBUM' | 'LYRICS' | 'GENRE' | 'DECADE' | 'HARDCORE' | 'SURVIVAL';
export type GameCategory = 'pop' | 'rock' | 'hip-hop' | 'electronic' | 'r&b' | 'country' | 'countryside' | 'indie' | 'jazz' | 'classical' | 'reggae' | 'metal' | 'latin' | 'hindi' | 'trending-english' | 'trending-india' | 'hits-2020s' | 'hits-2015' | 'hits-2010-26' | 'tiktok' | 'any';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface RoomSettings {
  mode: GameMode;
  rounds: number;
  guessTime: number;
  category: GameCategory;
  difficulty: Difficulty;
  maxPlayers: number;
  isPrivate: boolean;
  allowSpectators: boolean;
}

export interface Player {
  id: string;
  userId?: string;
  username: string;
  avatar: string | null;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  avgResponseTime: number;
  rank: number;
  isHost: boolean;
  isReady: boolean;
  isSpectator: boolean;
  isAlive: boolean;
  hasGuessed: boolean;
  socketId: string;
  guessTime?: number;
  roundPoints?: number;
  eliminatedAt?: number;
  kicked?: boolean;
}

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  spectators: Player[];
  settings: RoomSettings;
  status: RoomStatus;
  mode: GameMode;
  playerCount: number;
  maxPlayers: number;
  createdAt: string;
  password?: string;
}

export interface Round {
  roundNumber: number;
  totalRounds: number;
  mode: GameMode;
  duration: number;
  songTitle?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  previewUrl?: string;
  lyrics?: string;
  genre?: string;
  decade?: string;
  youtubeUrl?: string;
  startTime?: number;
  options?: string[];
}

// ─── Game Rounds ────────────────────────────────────
export interface RoundPayload {
  roundNumber: number;
  totalRounds: number;
  mode: GameMode;
  duration: number;
  songTitle?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  previewUrl?: string;
  options: string[];
}

export interface GuessResultPayload {
  correctIndex: number;
  correctAnswer: string;
  points: number;
  basePoints: number;
  speedBonus: number;
  speedTier: string;
  responseTime: number;
  wasCorrect: boolean;
}

export interface RoundEndPayload {
  roundNumber: number;
  players: Player[];
  correctAnswer: string;
}

export interface PlayerGuessPayload {
  playerId: string;
  option: string;
}

// ─── Chat ───────────────────────────────────────────
export interface ChatMessage {
  id: string;
  userId?: string;
  username: string;
  message: string;
  timestamp: number;
}

// ─── Friend ─────────────────────────────────────────
export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'BLOCKED';

export interface Friend {
  id: string;
  username: string;
  avatar: string | null;
  xp: number;
  level: number;
  isOnline: boolean;
  since: string;
}

export interface FriendRequest {
  id: string;
  username: string;
  avatar: string | null;
  xp: number;
  level: number;
  createdAt: string;
}

// ─── Game ───────────────────────────────────────────
export interface GameSummary {
  id: string;
  roomCode: string;
  mode: GameMode;
  status: RoomStatus;
  createdAt: string;
  endedAt: string | null;
  players: GamePlayerSummary[];
}

export interface GamePlayerSummary {
  id: string;
  username: string;
  avatar: string | null;
  score: number;
  rank: number;
  correctAnswers: number;
  totalAnswers: number;
  avgResponseTime: number;
  isHost: boolean;
}

// ─── Leaderboard ────────────────────────────────────
export interface LeaderboardEntry {
  rank?: number;
  userId: string;
  username: string;
  avatar: string | null;
  xp: number;
  level: number;
  wins: number;
  totalGames?: number;
  title?: string | null;
  border?: string | null;
  score?: number;
}

// ─── Achievement ────────────────────────────────────
export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
  unlockedAt: string;
}

// ─── Notification ───────────────────────────────────
export type NotificationType = 'FRIEND_REQUEST' | 'FRIEND_ACCEPT' | 'GAME_INVITE' | 'ACHIEVEMENT_UNLOCK' | 'LEVEL_UP' | 'MATCH_START';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// ─── User Stats ─────────────────────────────────────
export interface UserStats {
  totalGames: number;
  wins: number;
  winRate: number;
  xp: number;
  level: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
  avgResponseTime: number;
  currentStreak: number;
  longestStreak: number;
}

// ─── API Response ───────────────────────────────────
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── Socket Events ──────────────────────────────────
export interface ServerToClientEvents {
  'room:joined': (room: Room) => void;
  'room:player-joined': (player: Player) => void;
  'room:player-left': (playerId: string) => void;
  'room:player-ready': (playerId: string, isReady: boolean) => void;
  'room:chat-message': (message: ChatMessage) => void;
  'room:chat-history': (messages: ChatMessage[]) => void;
  'room:settings-updated': (settings: RoomSettings) => void;
  'room:host-migrated': (newHostId: string) => void;
  'room:kicked': () => void;
  'room:player-kicked': (playerId: string) => void;
  'room:password-required': () => void;
  'game:countdown': (seconds: number) => void;
  'game:round-start': (round: RoundPayload) => void;
  'game:audio-play': (url: string, duration: number) => void;
  'game:timer-update': (seconds: number) => void;
  'game:guess-result': (result: GuessResultPayload) => void;
  'game:player-guess': (data: PlayerGuessPayload) => void;
  'game:leaderboard': (players: Player[]) => void;
  'game:round-end': (data: RoundEndPayload) => void;
  'game:end': (results: Player[]) => void;
  'friend:online': (userId: string) => void;
  'friend:offline': (userId: string) => void;
  'notification:new': (notification: AppNotification) => void;
  'xp:update': (xp: number, level: number) => void;
  'achievement:unlock': (achievement: Achievement) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'room:create': (data: { username?: string; avatar?: string }) => void;
  'room:join': (code: string, data?: { username?: string; playerId?: string; avatar?: string }) => void;
  'room:leave': () => void;
  'room:ready': () => void;
  'room:chat': (message: string) => void;
  'room:update-settings': (settings: Partial<RoomSettings>) => void;
  'room:kick': (playerId: string) => void;
  'room:ban': (playerId: string) => void;
  'room:password': (password: string) => void;
  'game:start': () => void;
  'game:guess': (answer: string) => void;
  'player:reconnect': (roomCode: string) => void;
}
