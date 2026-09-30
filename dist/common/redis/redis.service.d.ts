import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    readonly client: Redis;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    del(...keys: string[]): Promise<void>;
    getJson<T>(key: string): Promise<T | null>;
    setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    deleteKeys(...keys: string[]): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<void>;
    static keys: {
        user: (id: string) => string;
        vendor: (id: string) => string;
        vendorBySlug: (slug: string) => string;
        listing: (id: string) => string;
        conversationMessages: (id: string) => string;
        commissionConfig: () => string;
        typesenseSync: (resource: string, id: string) => string;
    };
}
