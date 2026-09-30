export declare class QuoteLineItemDto {
    label: string;
    amount: number;
}
export declare class SendQuoteDto {
    clientId: string;
    listingId: string;
    eventId?: string;
    lineItems: QuoteLineItemDto[];
    paymentTerms?: string;
    validForDays?: number;
    validUntil?: string;
    description?: string;
    notes?: string;
}
