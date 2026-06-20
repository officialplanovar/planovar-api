import { ConfigService } from '@nestjs/config';
import { CancelSubscriptionInput, CreateSubscriptionInput, CreateSubscriptionResult, NormalizedWebhookEvent, PaymentProvider, VerifyTransactionResult, WebhookInput } from '../payment-provider.interface';
export declare class PaystackAdapter implements PaymentProvider {
    private readonly config;
    readonly name = "paystack";
    private readonly base;
    private readonly logger;
    constructor(config: ConfigService);
    private get secret();
    private headers;
    createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResult>;
    verifyTransaction(reference: string): Promise<VerifyTransactionResult>;
    cancelSubscription(input: CancelSubscriptionInput): Promise<void>;
    verifyAndParseWebhook(_input: WebhookInput): Promise<NormalizedWebhookEvent>;
}
