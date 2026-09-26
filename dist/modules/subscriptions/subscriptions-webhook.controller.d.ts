import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsWebhookController {
    private readonly config;
    private readonly subscriptions;
    private readonly logger;
    constructor(config: ConfigService, subscriptions: SubscriptionsService);
    paystackWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
