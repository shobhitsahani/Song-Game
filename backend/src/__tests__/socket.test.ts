import { describe, it, expect, vi } from 'vitest';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { generateRoomCode, RoomService } from '../services/room.service';
import { socketRateLimit } from '../middleware/rateLimiter';
import { setupSocketHandlers } from '../socket';

vi.mock('../config', () => ({
  config: {
    JWT_SECRET: 'test-secret-key',
    FRONTEND_URL: 'http://localhost:3000',
    REDIS_PREFIX: 'test',
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX: 100,
    CORS_ORIGIN: 'http://localhost:3000',
  },
}));

vi.mock('../redis', () => ({
  getRedis: () => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    ping: vi.fn().mockResolvedValue('PONG'),
    sadd: vi.fn().mockResolvedValue(1),
    srem: vi.fn().mockResolvedValue(1),
    smembers: vi.fn().mockResolvedValue([]),
    hset: vi.fn().mockResolvedValue(1),
    hgetall: vi.fn().mockResolvedValue({}),
    expire: vi.fn().mockResolvedValue(1),
    scard: vi.fn().mockResolvedValue(0),
    on: vi.fn(),
    quit: vi.fn().mockResolvedValue('OK'),
    disconnect: vi.fn(),
    publish: vi.fn().mockResolvedValue(1),
    subscribe: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('../database', () => ({
  getPrisma: () => ({
    user: { findUnique: vi.fn().mockResolvedValue({ id: 'test-user', username: 'TestUser' }) },
    $disconnect: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('Socket Handler Tests', () => {
  it('should setup socket handlers without error', () => {
    const httpServer = createServer();
    const io = new Server(httpServer);
    const roomService = new RoomService({
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
      setex: vi.fn().mockResolvedValue('OK'),
      del: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(1),
      publish: vi.fn().mockResolvedValue(1),
      on: vi.fn(),
    } as any);

    expect(() => setupSocketHandlers(io, {} as any, {} as any, roomService)).not.toThrow();
    httpServer.close();
  });

  it('should validate room code format', () => {
    const code = generateRoomCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });

  it('should serialize and deserialize room state', () => {
    const roomService = new RoomService({ on: vi.fn() } as any);

    const room: any = {
      code: 'ABC123',
      hostId: 'player1',
      players: new Map([['p1', { id: 'p1', username: 'Test', score: 0 }]]),
      spectators: new Map(),
      settings: { rounds: 10, guessTime: 15, category: 'pop', difficulty: 'medium', isPrivate: false, maxPlayers: 10, allowSpectators: true, mode: 'CLASSIC' },
      status: 'WAITING',
      currentRound: 0,
      rounds: [],
      mode: 'CLASSIC',
      bannedPlayers: new Set(),
      maxPlayers: 10,
    };

    const serialized = roomService.serializeRoom(room);
    expect(serialized).toBeTruthy();
    expect(typeof serialized).toBe('string');

    const deserialized = roomService.deserializeRoom(serialized);
    expect(deserialized.code).toBe('ABC123');
    expect(deserialized.players instanceof Map).toBe(true);
    expect(deserialized.bannedPlayers instanceof Set).toBe(true);
  });

  it('should handle guess rate limiting', () => {
    const limiter = socketRateLimit(2000, 1);
    expect(limiter('socket1')).toBe(true);
    expect(limiter('socket1')).toBe(false);
    expect(limiter('socket2')).toBe(true);
  });
});
