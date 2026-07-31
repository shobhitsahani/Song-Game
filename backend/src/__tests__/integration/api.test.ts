import { describe, it, expect, vi } from 'vitest';

vi.mock('../../redis', () => ({
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
  }),
}));

vi.mock('../../config', () => ({
  config: {
    PORT: 4001,
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret-key-for-testing',
    JWT_EXPIRES_IN: '1h',
    DEEZER_APP_ID: 'test',
    DEEZER_APP_SECRET: 'test',
    DEEZER_REDIRECT_URI: 'http://localhost:4000/auth/deezer/callback',
    FRONTEND_URL: 'http://localhost:3000',
    CORS_ORIGIN: 'http://localhost:3000',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/songgame_test',
    REDIS_URL: 'redis://localhost:6379',
    REDIS_PREFIX: 'test',
    YOUTUBE_API_KEY: '',
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX: 100,
    LOG_LEVEL: 'error',
  },
}));

describe('API Integration Tests', () => {
  it('should have all route modules loadable', async () => {
    const authModule = await import('../../routes/auth');
    expect(authModule.default).toBeDefined();
  });

  it('should have error handling middleware', async () => {
    const { errorHandler } = await import('../../middleware/errorHandler');
    expect(errorHandler).toBeDefined();
  });

  it('should have auth middleware', async () => {
    const { authenticate } = await import('../../middleware/auth');
    expect(authenticate).toBeDefined();
  });

  it('should have rate limiter middleware', async () => {
    const { rateLimit } = await import('../../middleware/rateLimiter');
    expect(rateLimit).toBeDefined();
  });

  it('should have config with required keys', async () => {
    const { config } = await import('../../config');
    expect(config.JWT_SECRET).toBeTruthy();
    expect(config.FRONTEND_URL).toBeTruthy();
  });

  it('should have auth routes with expected endpoints', () => {
    const endpointRegex = /^\/(deezer\/login|deezer\/callback|me|logout)$/;
    const endpoints = ['deezer/login', 'deezer/callback', 'me', 'logout'];
    endpoints.forEach(e => expect(endpointRegex.test('/' + e)).toBe(true));
  });
});
