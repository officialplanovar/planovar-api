import { QuotePaymentStructure } from '@prisma/client';
import { CreateInstallmentDto, CreateQuoteLineItemDto } from './create-quote.dto';
export declare class UpdateQuoteDto {
    notes?: string;
    description?: string;
    validUntil?: string;
    paymentStructure?: QuotePaymentStructure;
    escrowPercentage?: number;
    totalAmount?: number;
    lineItems?: CreateQuoteLineItemDto[];
    installments?: CreateInstallmentDto[];
}
