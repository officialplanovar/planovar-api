import { QuoteLineItemDto } from './send-quote.dto';
export declare class ReviseQuoteDto {
    lineItems: QuoteLineItemDto[];
    paymentTerms?: string;
    validUntil?: string;
    description?: string;
    notes?: string;
}
