export declare class CreateQuoteLineItemDto {
    label: string;
    amount: number;
    sortOrder?: number;
}
export declare class CreateQuoteDto {
    bookingId: string;
    totalAmount: number;
    paymentTerms?: string;
    validUntil: string;
    notes?: string;
    description?: string;
    lineItems: CreateQuoteLineItemDto[];
}
