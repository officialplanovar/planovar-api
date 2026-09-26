import { BillingCycle } from '@prisma/client';
export declare class SubscribeDto {
    planId: string;
    billingCycle?: BillingCycle;
    callbackUrl?: string;
}
