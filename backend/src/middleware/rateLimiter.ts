import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors';
import { config } from '../config';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, CLEANUP_INTERVAL);

export function rateLimit(options?: { windowMs?: number; max?: number }) {
  const windowMs = options?.windowMs ?? config.RATE_LIMIT_WINDOW_MS;
  const max = options?.max ?? config.RATE_LIMIT_MAX;

  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = req.user?.userId || req.ip || 'anonymous';
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= max) {
      throw new RateLimitError(`Rate limit exceeded. Try again in ${Math.ceil((entry.resetAt - now) / 1000)}s`);
    }

    entry.count++;
    next();
  };
}

export function socketRateLimit(windowMs: number = 1000, max: number = 10) {
  const store = new Map<string, { count: number; resetAt: number }>();

  return (socketId: string): boolean => {
    const now = Date.now();
    const entry = store.get(socketId);

    if (!entry || entry.resetAt <= now) {
      store.set(socketId, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (entry.count >= max) {
      return false;
    }

    entry.count++;
    return true;
  };
}
