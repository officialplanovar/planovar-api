import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export interface PushPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
    badge?: number;
}
export declare class FirebaseService implements OnModuleInit {
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private app;
    constructor(config: ConfigService, prisma: PrismaService);
    onModuleInit(): void;
    pushToUser(userId: string, payload: PushPayload): Promise<void>;
    pushToUsers(userIds: string[], payload: PushPayload): Promise<void>;
    registerToken(userId: string, token: string, platform: 'IOS' | 'ANDROID' | 'WEB'): Promise<void>;
    removeToken(token: string): Promise<void>;
    private sendMulticast;
    private chunk;
}
