import { Socket } from 'socket.io';

export type GameMode = 'CLASSIC' | 'ARTIST' | 'ALBUM' | 'LYRICS' | 'GENRE' | 'DECADE' | 'YEAR' | 'HARDCORE' | 'SURVIVAL' | 'PARTY' | 'CUSTOM';

export interface PlayerSession {
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
  isSpectator: boolean;
  isAlive: boolean;
  socketId: string;
  hasGuessed: boolean;
  guessTime?: number;
  eliminatedAt?: number;
  kicked?: boolean;
}

export interface MessageReactions {
  [messageId: string]: {
    [emoji: string]: string[];
  };
}

export interface RoomState {
  code: string;
  hostId: string;
  players: Map<string, PlayerSession>;
  spectators: Map<string, PlayerSession>;
  settings: GameSettings;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  currentRound: number;
  rounds: RoundData[];
  roundStartTime?: number;
  mode: GameMode;
  password?: string;
  bannedPlayers: Set<string>;
  maxPlayers: number;
  messageReactions?: MessageReactions;
  previewTimer?: ReturnType<typeof setTimeout>;
  answerTimer?: ReturnType<typeof setTimeout>;
  countdownTimer?: ReturnType<typeof setInterval>;
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

export interface RoundData {
  roundNumber: number;
  mode: GameMode;
  songId: number;
  songTitle: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string;
  duration: number;
  options: string[];
  correctIndex: number;
}

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
  avatar?: string;
  data: {
    [key: string]: any;
  };
}

export interface ServerToClientEvents {
  'room:joined': (data: any) => void;
  'room:player-joined': (player: any) => void;
  'room:player-left': (playerId: string) => void;
  'room:player-ready': (playerId: string, isReady: boolean) => void;
  'room:chat-message': (message: any) => void;
  'room:settings-updated': (settings: GameSettings) => void;
  'room:host-migrated': (newHostId: string) => void;
  'room:kicked': () => void;
  'room:player-kicked': (playerId: string) => void;
  'room:player-banned': (playerId: string) => void;
  'room:typing': (userId: string | undefined, username: string) => void;
  'room:password-required': () => void;
  'room:password-correct': () => void;
  'game:countdown': (seconds: number) => void;
  'game:mode-info': (mode: GameMode, settings: any) => void;
  'round:start': (data: {
    roundNumber: number;
    totalRounds: number;
    mode: GameMode;
    song: { albumArt: string; artist?: string; album?: string; songTitle?: string; previewUrl: string };
    options: string[];
    duration: number;
  }) => void;
  'song:play': (previewUrl: string, duration: number) => void;
  'answer:reveal': (data: { correctIndex: number; correctAnswer: string; points: number; basePoints: number; speedBonus: number; speedTier: string; responseTime: number; wasCorrect: boolean }) => void;
  'timer:update': (timeLeft: number) => void;
  'score:update': (players: any[]) => void;
  'round:end': (data: { roundNumber: number; players: any[]; correctAnswer: string }) => void;
  'game:end': (results: any[]) => void;
  'player:reconnected': (playerId: string) => void;
  'friend:online': (userId: string) => void;
  'friend:offline': (userId: string) => void;
  'notification:new': (notification: any) => void;
  'xp:update': (xp: number, level: number) => void;
  'achievement:unlock': (achievement: any) => void;
  'leaderboard:update': (data: { type: string; userId: string; score: number }) => void;
  'chat:reactions-updated': (data: { messageId: string; reactions: { [emoji: string]: string[] } }) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'room:join': (code: string, opts?: { username?: string; avatar?: string }) => void;
  'room:leave': () => void;
  'room:ready': () => void;
  'room:chat': (message: string) => void;
  'room:update-settings': (settings: Partial<GameSettings>) => void;
  'room:kick': (playerId: string) => void;
  'room:ban': (playerId: string) => void;
  'room:typing': (isTyping: boolean) => void;
  'room:password': (password: string) => void;
  'game:start': () => void;
  'answer:submit': (answer: string) => void;
  'player:reconnect': (roomCode: string) => void;
  'friend:request': (userId: string) => void;
  'friend:accept': (userId: string) => void;
  'friend:reject': (userId: string) => void;
  'friend:remove': (userId: string) => void;
  'matchmaking:join': (data: any) => void;
  'matchmaking:leave': () => void;
}
