import Redis from 'ioredis';

class RedisService {
  private client: Redis | null = null;

  connect(url?: string) {
    this.client = new Redis(url || process.env.REDIS_URL || 'redis://localhost:6379');
    return this.client;
  }

  getClient(): Redis {
    if (!this.client) {
      this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.getClient().get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.getClient().setex(key, ttl, value);
    } else {
      await this.getClient().set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.getClient().del(key);
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}

export const redisService = new RedisService();
