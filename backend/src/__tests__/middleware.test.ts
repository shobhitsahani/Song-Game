import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimit, socketRateLimit } from '../middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should allow requests within limit', () => {
    const limiter = rateLimit({ windowMs: 60000, max: 5 });
    const req = { ip: '127.0.0.1', user: undefined } as any;
    const res = {} as any;
    const next = vi.fn();

    for (let i = 0; i < 5; i++) {
      limiter(req, res, next);
    }
    expect(next).toHaveBeenCalledTimes(5);
  });

  it('should block requests over limit', () => {
    const windowMs = 1000;
    const limiter = rateLimit({ windowMs, max: 2 });
    const req = { ip: '127.0.0.2', user: undefined } as any;
    const res = {} as any;
    const next = vi.fn();

    limiter(req, res, next);
    limiter(req, res, next);
    expect(() => limiter(req, res, next)).toThrow('Rate limit exceeded');
  });

  it('should reset after window expires', () => {
    const windowMs = 1000;
    const limiter = rateLimit({ windowMs, max: 2 });
    const req = { ip: '127.0.0.3', user: undefined } as any;
    const res = {} as any;
    const next = vi.fn();

    limiter(req, res, next);
    limiter(req, res, next);
    expect(() => limiter(req, res, next)).toThrow('Rate limit exceeded');

    vi.advanceTimersByTime(windowMs + 100);
    expect(next).toHaveBeenCalledTimes(2);
  });
});

describe('Socket Rate Limiter', () => {
  it('should allow requests within limit', () => {
    const limiter = socketRateLimit(1000, 3);
    for (let i = 0; i < 3; i++) {
      expect(limiter('socket1')).toBe(true);
    }
  });

  it('should block requests over limit', () => {
    const limiter = socketRateLimit(1000, 2);
    expect(limiter('socket2')).toBe(true);
    expect(limiter('socket2')).toBe(true);
    expect(limiter('socket2')).toBe(false);
  });

  it('should track different sockets independently', () => {
    const limiter = socketRateLimit(1000, 1);
    expect(limiter('socketA')).toBe(true);
    expect(limiter('socketA')).toBe(false);
    expect(limiter('socketB')).toBe(true);
  });
});
