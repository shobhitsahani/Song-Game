import Redis from 'ioredis';
import { config } from './config';
import { logger } from './utils/logger';

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        if (times > 10) {
          logger.error('Redis max retries reached');
          return null;
        }
        return Math.min(times * 50, 2000);
      },
      lazyConnect: true,
      enableOfflineQueue: true,
    });

    redis.on('error', (err) => {
      logger.error('Redis connection error', { error: err.message });
    });

    redis.on('connect', () => {
      logger.info('Connected to Redis');
    });

    redis.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }
  return redis;
}

export async function connectRedis(): Promise<void> {
  try {
    await getRedis().connect();
  } catch (error) {
    logger.warn('Redis connection failed, running without cache');
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    redis.disconnect();
    logger.info('Disconnected from Redis');
  }
}

export async function redisHealthCheck(): Promise<boolean> {
  try {
    await getRedis().ping();
    return true;
  } catch {
    return false;
  }
}
