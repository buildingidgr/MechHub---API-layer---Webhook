import Redis from 'ioredis';

export class CacheService {
  private static redis: Redis;

  static async connect() {
    this.redis = new Redis(process.env.REDIS_URL as string);
  }

  static async setApiKey(userId: string, apiKey: string, ttl: number = 86400) {
    if (!this.redis) await this.connect();
    await this.redis.set(`apikey:${userId}`, apiKey, 'EX', ttl);
  }

  static async getApiKey(userId: string): Promise<string | null> {
    if (!this.redis) await this.connect();
    return this.redis.get(`apikey:${userId}`);
  }
}

