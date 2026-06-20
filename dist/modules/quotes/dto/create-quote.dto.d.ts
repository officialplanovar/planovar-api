import { InstallmentType, QuotePaymentStructure } from '@prisma/client';
export declare class CreateQuoteLineItemDto {
    label: string;
    amount: number;
    sortOrder?: number;
}
export declare class CreateInstallmentDto {
    label: string;
    type: InstallmentType;
    percentage: number;
    dueAt: string;
    sortOrder?: number;
}
export declare class CreateQuoteDto {
    bookingId: string;
    paymentStructure: QuotePaymentStructure;
    totalAmount: number;
    escrowPercentage?: number;
    validUntil: string;
    notes?: string;
    description?: string;
    lineItems: CreateQuoteLineItemDto[];
    installments?: CreateInstallmentDto[];
}
