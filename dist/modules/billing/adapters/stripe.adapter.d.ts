import { ConfigService } from '@nestjs/config';
import { CancelSubscriptionInput, CreateSubscriptionInput, CreateSubscriptionResult, NormalizedWebhookEvent, PaymentProvider, WebhookInput } from '../payment-provider.interface';
export declare class StripeAdapter implements PaymentProvider {
    private readonly config;
    readonly name = "stripe";
    private readonly logger;
    private _stripe;
    constructor(config: ConfigService);
    private get stripe();
    createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResult>;
    cancelSubscription(input: CancelSubscriptionInput): Promise<void>;
    verifyAndParseWebhook(input: WebhookInput): Promise<NormalizedWebhookEvent>;
    private flattenMeta;
}
