import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { IapVerifyDto } from './dto/iap-verify.dto';
export declare class IapService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService);
    verify(userId: string, dto: IapVerifyDto): Promise<{
        status: string;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        expiresAt: Date;
    }>;
    private validateApple;
    private resolveAppleTransactionId;
    private findAppleProduct;
    private isAppleWrongEnvironment;
    private appleAppAppleId;
    private errText;
    private validateGoogle;
    private gTime;
    private googleLineItemIsTrial;
    handleAppleNotification(body: {
        signedPayload?: string;
    }): Promise<void>;
    handleGoogleNotification(body: {
        message?: {
            data?: string;
            attributes?: Record<string, string>;
        };
        subscription?: string;
        token?: string;
    }): Promise<void>;
    private applyNotification;
    private classifyAppleType;
    private classifyGoogleType;
    private requireVendor;
}
