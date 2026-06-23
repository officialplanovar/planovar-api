import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Global Redis service. Wraps ioredis rather than extending it so NestJS
 * dependency injection works without clashing with ioredis's own `config` property.
 * Use `redisService.client` for raw ioredis access, or the typed helpers below.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    this.client = new Redis(config.getOrThrow<string>('REDIS_URL'), {
      // Railway's internal hostnames (e.g. redis.railway.internal) are IPv6-only.
      // ioredis defaults to IPv4 DNS lookup (family 4) and can't resolve them,
      // which would throw in onModuleInit and crash boot. family 0 = both.
      family: 0,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
    });

    this.client.on('error', (err) => this.logger.error('Redis error', err));
    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('reconnecting', () => this.logger.warn('Redis reconnecting…'));
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  // ─── Typed helpers ───────────────────────────────────────────────────────

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await this.client.del(...keys);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.set(key, serialized, ttlSeconds);
  }

  async deleteKeys(...keys: string[]): Promise<void> {
    await this.del(...keys);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length) await this.client.del(...keys);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  // ─── Cache key builders ──────────────────────────────────────────────────

  static keys = {
    user: (id: string) => `user:${id}`,
    vendor: (id: string) => `vendor:${id}`,
    vendorBySlug: (slug: string) => `vendor:slug:${slug}`,
    listing: (id: string) => `listing:${id}`,
    conversationMessages: (id: string) => `conv:${id}:messages`,
    commissionConfig: () => 'platform:commission_config',
    typesenseSync: (resource: string, id: string) => `ts_sync:${resource}:${id}`,
  };
}
