import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { IapVerifyDto } from './dto/iap-verify.dto';
import { IapService } from './iap.service';
export declare class IapController {
    private readonly iap;
    constructor(iap: IapService);
    verify(req: Request, dto: IapVerifyDto): Promise<{
        status: string;
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        expiresAt: Date;
    }>;
    appleWebhook(req: RawBodyRequest<Request>, body: {
        signedPayload?: string;
    }): Promise<{
        received: boolean;
    }>;
    googleWebhook(req: RawBodyRequest<Request>, body: {
        message?: {
            data?: string;
        };
    }): Promise<{
        received: boolean;
    }>;
}
