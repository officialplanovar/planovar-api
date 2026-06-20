export declare class InitiatePaymentDto {
    installmentId: string;
    provider?: 'paystack' | 'flutterwave';
    callbackUrl?: string;
}
