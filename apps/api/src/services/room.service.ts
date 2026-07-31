import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.js';
import { getRedis } from '../config/redis.js';
import { generateRoomCode } from '@song-game/shared';
import type { Room, RoomSettings, Player, RoomStatus, GameMode, ChatMessage } from '@song-game/types';

const rooms = new Map<string, RoomState>();
const userSocketMap = new Map<string, string>();

const MAX_CHAT_HISTORY = 30;

export interface GameRound {
  roundNumber: number;
  mode: GameMode;
  songTitle: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl: string;
  duration: number;
  options: string[];
  correctIndex: number;
}

interface RoomState {
  code: string;
  hostId: string;
  players: Map<string, Player>;
  spectators: Map<string, Player>;
  settings: RoomSettings;
  status: RoomStatus;
  currentRound: number;
  mode: GameMode;
  password?: string;
  bannedPlayers: Set<string>;
  maxPlayers: number;
  createdAt: number;
  chatHistory: ChatMessage[];
  rounds: GameRound[];
  roundStartTime?: number;
  phase?: 'preview' | 'answer';
  timeLeft?: number;
}

const DEFAULT_SETTINGS: RoomSettings = {
  mode: 'CLASSIC',
  rounds: 10,
  guessTime: 20,
  category: 'any',
  difficulty: 'medium',
  maxPlayers: 8,
  isPrivate: false,
  allowSpectators: true,
};

export function createRoom(userId: string | undefined, username: string, avatar: string | null): { room: Room; playerId: string } {
  const code = generateRoomCode();
  const playerId = uuidv4();

  const player: Player = {
    id: playerId,
    userId,
    username,
    avatar,
    score: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    avgResponseTime: 0,
    rank: 0,
    isHost: true,
    isReady: false,
    isSpectator: false,
    isAlive: true,
    hasGuessed: false,
    socketId: '',
  };

  const roomState: RoomState = {
    code,
    hostId: playerId,
    players: new Map([[playerId, player]]),
    spectators: new Map(),
    settings: { ...DEFAULT_SETTINGS },
    status: 'WAITING',
    currentRound: 0,
    mode: 'CLASSIC',
    bannedPlayers: new Set(),
    maxPlayers: DEFAULT_SETTINGS.maxPlayers,
    createdAt: Date.now(),
    chatHistory: [],
    rounds: [],
  };

  rooms.set(code, roomState);

  const room = serializeRoom(roomState);
  return { room, playerId };
}

export function joinRoom(socketId: string, code: string, userId: string | undefined, username: string, avatar: string | null): { room: Room; player: Player } | { error: string } {
  const roomState = rooms.get(code);
  if (!roomState) return { error: 'Room not found' };

  if (userId && roomState.bannedPlayers.has(userId)) {
    return { error: 'You are banned from this room' };
  }

  const isSpectator = roomState.status === 'PLAYING';

  if (!isSpectator && roomState.players.size >= roomState.maxPlayers) {
    return { error: 'Room is full' };
  }

  const playerId = uuidv4();
  const player: Player = {
    id: playerId,
    userId,
    username,
    avatar,
    score: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    avgResponseTime: 0,
    rank: 0,
    isHost: false,
    isReady: false,
    isSpectator,
    isAlive: true,
    hasGuessed: false,
    socketId,
  };

  if (isSpectator) {
    roomState.spectators.set(playerId, player);
  } else {
    roomState.players.set(playerId, player);
  }

  return { room: serializeRoom(roomState), player };
}

export function leaveRoom(socketId: string, code: string): { updatedRoom?: Room; kicked?: boolean } {
  const roomState = rooms.get(code);
  if (!roomState) return {};

  const player = findPlayerInRoom(socketId, roomState);
  if (!player) return {};

  roomState.players.delete(player.id);
  roomState.spectators.delete(player.id);

  const isKicked = player.kicked;

  if (roomState.players.size === 0 && roomState.spectators.size === 0) {
    rooms.delete(code);
    return { kicked: isKicked };
  }

  if (player.isHost && roomState.players.size > 0) {
    const newHost = [...roomState.players.values()][0];
    newHost.isHost = true;
    roomState.hostId = newHost.id;
  }

  return { updatedRoom: serializeRoom(roomState), kicked: isKicked };
}

export function getRoom(code: string): Room | undefined {
  const roomState = rooms.get(code);
  return roomState ? serializeRoom(roomState) : undefined;
}

export function getRoomState(code: string): RoomState | undefined {
  return rooms.get(code);
}

export function addChatMessage(code: string, message: ChatMessage): void {
  const roomState = rooms.get(code);
  if (!roomState) return;
  roomState.chatHistory.push(message);
  if (roomState.chatHistory.length > MAX_CHAT_HISTORY) {
    roomState.chatHistory.splice(0, roomState.chatHistory.length - MAX_CHAT_HISTORY);
  }
}

export function getChatHistory(code: string): ChatMessage[] {
  return rooms.get(code)?.chatHistory ?? [];
}

export function findRoomBySocketId(socketId: string): { code: string; room: RoomState } | undefined {
  for (const [code, room] of rooms.entries()) {
    if (findPlayerInRoom(socketId, room)) {
      return { code, room };
    }
  }
  return undefined;
}

export function setPlayerSocketId(playerId: string, socketId: string, code: string): void {
  const roomState = rooms.get(code);
  if (!roomState) return;
  const player = roomState.players.get(playerId) || roomState.spectators.get(playerId);
  if (player) {
    player.socketId = socketId;
  }
}

export function toggleReady(socketId: string, code: string): Player | undefined {
  const roomState = rooms.get(code);
  if (!roomState || roomState.status !== 'WAITING') return undefined;

  const player = findPlayerInRoom(socketId, roomState);
  if (!player || player.isSpectator) return undefined;

  player.isReady = !player.isReady;
  return player;
}

export function updateSettings(socketId: string, code: string, newSettings: Partial<RoomSettings>): RoomSettings | undefined {
  const roomState = rooms.get(code);
  if (!roomState || roomState.status !== 'WAITING') return undefined;

  const player = findPlayerInRoom(socketId, roomState);
  if (!player?.isHost) return undefined;

  Object.assign(roomState.settings, newSettings);
  if (newSettings.mode) roomState.mode = newSettings.mode;
  return roomState.settings;
}

export function kickPlayer(hostSocketId: string, targetPlayerId: string, code: string): Player | undefined {
  const roomState = rooms.get(code);
  if (!roomState) return undefined;

  const host = findPlayerInRoom(hostSocketId, roomState);
  if (!host?.isHost) return undefined;

  const target = roomState.players.get(targetPlayerId) || roomState.spectators.get(targetPlayerId);
  if (!target) return undefined;

  target.kicked = true;
  return target;
}

export async function banPlayer(hostSocketId: string, targetPlayerId: string, code: string, userId?: string): Promise<Player | undefined> {
  const roomState = rooms.get(code);
  if (!roomState) return undefined;

  const host = findPlayerInRoom(hostSocketId, roomState);
  if (!host?.isHost) return undefined;

  const target = roomState.players.get(targetPlayerId) || roomState.spectators.get(targetPlayerId);
  if (!target) return undefined;

  if (target.userId) {
    roomState.bannedPlayers.add(target.userId);
  }

  target.kicked = true;
  return target;
}

export function startGame(socketId: string, code: string): { room: Room } | { error: string } {
  const roomState = rooms.get(code);
  if (!roomState) return { error: 'Room not found' };

  const player = findPlayerInRoom(socketId, roomState);
  if (!player?.isHost) return { error: 'Only the host can start the game' };
  if (roomState.status !== 'WAITING') return { error: 'Game already started' };
  if (roomState.players.size < 1) return { error: 'Need at least 1 player' };

  roomState.status = 'PLAYING';
  roomState.currentRound = 0;
  roomState.rounds = [];
  roomState.roundStartTime = undefined;
  roomState.phase = undefined;
  roomState.timeLeft = undefined;

  for (const p of roomState.players.values()) {
    p.score = 0;
    p.correctAnswers = 0;
    p.totalAnswers = 0;
    p.avgResponseTime = 0;
    p.hasGuessed = false;
    p.guessTime = undefined;
    p.roundPoints = 0;
    p.isAlive = true;
    p.rank = 0;
  }

  return { room: serializeRoom(roomState) };
}

export function resetRoomGame(code: string): void {
  const roomState = rooms.get(code);
  if (!roomState) return;

  roomState.status = 'WAITING';
  roomState.currentRound = 0;
  roomState.rounds = [];
  roomState.roundStartTime = undefined;
  roomState.phase = undefined;
  roomState.timeLeft = undefined;

  for (const p of roomState.players.values()) {
    p.score = 0;
    p.correctAnswers = 0;
    p.totalAnswers = 0;
    p.avgResponseTime = 0;
    p.hasGuessed = false;
    p.guessTime = undefined;
    p.roundPoints = 0;
    p.isAlive = true;
    p.rank = 0;
  }
}

export function getPublicRooms(): { code: string; playerCount: number; maxPlayers: number; mode: GameMode }[] {
  const available: { code: string; playerCount: number; maxPlayers: number; mode: GameMode }[] = [];
  rooms.forEach((room, code) => {
    if (room.status === 'WAITING' && !room.settings.isPrivate) {
      available.push({
        code,
        playerCount: room.players.size,
        maxPlayers: room.maxPlayers,
        mode: room.mode,
      });
    }
  });
  return available;
}

export function deleteRoom(code: string): void {
  rooms.delete(code);
}

export function setUserSocketId(userId: string, socketId: string): void {
  userSocketMap.set(userId, socketId);
}

export function getUserSocketId(userId: string): string | undefined {
  return userSocketMap.get(userId);
}

export function removeUserSocketId(userId: string): void {
  userSocketMap.delete(userId);
}

function findPlayerInRoom(socketId: string, room: RoomState): Player | undefined {
  for (const player of room.players.values()) {
    if (player.socketId === socketId) return player;
  }
  for (const player of room.spectators.values()) {
    if (player.socketId === socketId) return player;
  }
  return undefined;
}

export function findPlayerByUserId(userId: string, room: RoomState): Player | undefined {
  for (const player of room.players.values()) {
    if (player.userId === userId) return player;
  }
  for (const player of room.spectators.values()) {
    if (player.userId === userId) return player;
  }
  return undefined;
}

export function findPlayerById(playerId: string, room: RoomState): Player | undefined {
  return room.players.get(playerId) || room.spectators.get(playerId);
}

function serializeRoom(room: RoomState): Room {
  return {
    code: room.code,
    hostId: room.hostId,
    players: [...room.players.values()].filter((p) => !p.kicked),
    spectators: [...room.spectators.values()].filter((p) => !p.kicked),
    settings: room.settings,
    status: room.status,
    mode: room.mode,
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
    createdAt: new Date(room.createdAt).toISOString(),
  };
}

export { serializeRoom, findPlayerInRoom };
export type { RoomState };
