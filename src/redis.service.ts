import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async getCache<T>(key: string): Promise<T> {
    const cachedData = await this.redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData) as T;
    }
    return null;
  }

  async setCache(key: string, data: any) {
    // Store data in Redis cache with 10 minutes expiration
    await this.redis.set(key, JSON.stringify(data), 'EX', 600);
  }
}
