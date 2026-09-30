import { ConfigService } from '@nestjs/config';
import { CancelSubscriptionInput, CreateSubscriptionInput, CreateSubscriptionResult, NormalizedWebhookEvent, PaymentProvider, WebhookInput } from '../payment-provider.interface';
export declare class StoreIapAdapter implements PaymentProvider {
    private readonly config;
    readonly name = "iap";
    constructor(config: ConfigService);
    createSubscription(_input: CreateSubscriptionInput): Promise<CreateSubscriptionResult>;
    cancelSubscription(_input: CancelSubscriptionInput): Promise<void>;
    verifyAndParseWebhook(_input: WebhookInput): Promise<NormalizedWebhookEvent>;
}
