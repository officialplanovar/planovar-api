import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagingService } from '../messaging/messaging.service';
export declare class CallsService {
    private readonly prisma;
    private readonly config;
    private readonly messaging;
    constructor(prisma: PrismaService, config: ConfigService, messaging: MessagingService);
    createToken(userId: string, conversationId: string): Promise<{
        url: string;
        token: string;
        roomName: string;
    }>;
}
