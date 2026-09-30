import { CreateQuoteLineItemDto } from './create-quote.dto';
export declare class UpdateQuoteDto {
    notes?: string;
    description?: string;
    validUntil?: string;
    paymentTerms?: string;
    totalAmount?: number;
    lineItems?: CreateQuoteLineItemDto[];
}
