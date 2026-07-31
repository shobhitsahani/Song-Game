import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { logger } from '../utils/logger';
import { RoomState, PlayerSession, GameSettings } from '../types';

const ROOM_TTL = 7200;
const LOCK_TTL = 5000;
const PREFIX = config.REDIS_PREFIX;

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function generateUniqueRoomCode(redis: Redis): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const code = generateRoomCode();
    const exists = await redis.exists(`${PREFIX}:room:${code}`);
    if (!exists) return code;
    attempts++;
  }
  throw new Error('Unable to generate unique room code');
}

export class RoomService {
  private redis: Redis;
  private localCache: Map<string, RoomState>;
  private cacheTTL: number;

  constructor(redis: Redis) {
    this.redis = redis;
    this.localCache = new Map();
    this.cacheTTL = parseInt(process.env.ROOM_CACHE_TTL || '5000', 10);
  }

  private roomKey(code: string): string {
    return `${PREFIX}:room:${code}`;
  }

  private lockKey(code: string): string {
    return `${PREFIX}:lock:${code}`;
  }

  private playerKey(userId: string): string {
    return `${PREFIX}:player-room:${userId}`;
  }

  private nextRoundKey(code: string): string {
    return `${PREFIX}:next-round:${code}`;
  }

  private async acquireLock(code: string): Promise<boolean> {
    const result = await this.redis.set(this.lockKey(code), '1', 'PX', LOCK_TTL, 'NX');
    return result === 'OK';
  }

  private async releaseLock(code: string): Promise<void> {
    await this.redis.del(this.lockKey(code));
  }

  async createRoom(room: RoomState): Promise<void> {
    const key = this.roomKey(room.code);
    const serialized = this.serializeRoom(room);
    await this.redis.setex(key, ROOM_TTL, serialized);
    this.localCache.set(room.code, room);
  }

  async getRoom(code: string): Promise<RoomState | null> {
    const cached = this.localCache.get(code);
    if (cached) return cached;

    const key = this.roomKey(code);
    const data = await this.redis.get(key);
    if (!data) return null;

    const room = this.deserializeRoom(data);
    this.localCache.set(code, room);
    setTimeout(() => this.localCache.delete(code), this.cacheTTL);
    return room;
  }

  async updateRoom(code: string, updates: Partial<RoomState>): Promise<RoomState | null> {
    const locked = await this.acquireLock(code);
    if (!locked) {
      const room = await this.getRoom(code);
      if (room) {
        Object.assign(room, updates);
        await this.createRoom(room);
      }
      return room;
    }

    try {
      const room = await this.getRoom(code);
      if (!room) return null;
      Object.assign(room, updates);
      await this.createRoom(room);
      return room;
    } finally {
      await this.releaseLock(code);
    }
  }

  async deleteRoom(code: string): Promise<void> {
    const key = this.roomKey(code);
    await this.redis.del(key);
    this.localCache.delete(code);
  }

  async addPlayerToRoom(roomCode: string, player: PlayerSession): Promise<RoomState | null> {
    const room = await this.getRoom(roomCode);
    if (!room) return null;

    room.players.set(player.id, player);
    await this.createRoom(room);

    if (player.userId) {
      await this.redis.setex(this.playerKey(player.userId), ROOM_TTL, roomCode);
    }
    return room;
  }

  async removePlayerFromRoom(roomCode: string, playerId: string): Promise<RoomState | null> {
    const room = await this.getRoom(roomCode);
    if (!room) return null;

    const player = room.players.get(playerId);
    room.players.delete(playerId);
    room.spectators.delete(playerId);

    if (player?.userId) {
      await this.redis.del(this.playerKey(player.userId));
    }

    if (room.players.size === 0 && room.spectators.size === 0) {
      await this.deleteRoom(roomCode);
      return null;
    }

    if (player?.isHost && room.players.size > 0) {
      const newHost = [...room.players.values()][0];
      newHost.isHost = true;
      room.hostId = newHost.id;
    }

    await this.createRoom(room);
    return room;
  }

  async getRoomByUserId(userId: string): Promise<string | null> {
    return this.redis.get(this.playerKey(userId));
  }

  async getActiveRooms(): Promise<Array<{ code: string; playerCount: number; status: string }>> {
    const keys = await this.redis.keys(`${PREFIX}:room:*`);
    const rooms: Array<{ code: string; playerCount: number; status: string }> = [];

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        try {
          const room = this.deserializeRoom(data);
          rooms.push({
            code: room.code,
            playerCount: room.players.size,
            status: room.status,
          });
        } catch { /* skip corrupted */ }
      }
    }
    return rooms;
  }

  async acquireRoundLock(code: string): Promise<boolean> {
    return this.acquireLock(this.nextRoundKey(code));
  }

  async releaseRoundLock(code: string): Promise<void> {
    await this.redis.del(this.lockKey(this.nextRoundKey(code)));
  }

  async extendRoomTTL(code: string): Promise<void> {
    const key = this.roomKey(code);
    await this.redis.expire(key, ROOM_TTL);
  }

  async publishEvent(channel: string, event: string, data: unknown): Promise<void> {
    await this.redis.publish(`${PREFIX}:${channel}`, JSON.stringify({ event, data }));
  }

  serializeRoom(room: RoomState): string {
    return JSON.stringify({
      code: room.code,
      hostId: room.hostId,
      players: [...room.players.entries()],
      spectators: [...room.spectators.entries()],
      settings: room.settings,
      status: room.status,
      currentRound: room.currentRound,
      rounds: room.rounds,
      roundStartTime: room.roundStartTime,
      mode: room.mode,
      bannedPlayers: [...room.bannedPlayers],
      maxPlayers: room.maxPlayers,
      password: room.password,
    });
  }

  deserializeRoom(data: string): RoomState {
    const parsed = JSON.parse(data);
    return {
      code: parsed.code,
      hostId: parsed.hostId,
      players: new Map(parsed.players || []),
      spectators: new Map(parsed.spectators || []),
      settings: parsed.settings,
      status: parsed.status,
      currentRound: parsed.currentRound || 0,
      rounds: parsed.rounds || [],
      roundStartTime: parsed.roundStartTime,
      mode: parsed.mode,
      bannedPlayers: new Set(parsed.bannedPlayers || []),
      maxPlayers: parsed.maxPlayers || 10,
      password: parsed.password,
    };
  }
}
