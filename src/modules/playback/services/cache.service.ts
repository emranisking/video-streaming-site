import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(CacheService.name);

  constructor() {
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD || undefined;

    this.client = new Redis({
      host,
      port,
      password,
      lazyConnect: true,
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Connected to Redis');
    } catch (err) {
      this.logger.error('Redis connection failed', err);
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
      this.logger.log('Redis disconnected');
    } catch (err) {
      this.logger.error('Error disconnecting Redis', err);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const raw = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.setex(key, ttlSeconds, raw);
    } else {
      await this.client.set(key, raw);
    }
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }
}
