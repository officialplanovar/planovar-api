import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export type QuoteForInvoice = {
    id: string;
    clientId: string | null;
    vendorId: string;
    listingId: string | null;
    eventId: string | null;
    conversationId: string | null;
    amount: Prisma.Decimal;
    paymentTerms: string | null;
    lineItems: {
        label: string;
        amount: Prisma.Decimal;
        sortOrder: number;
    }[];
};
export declare class InvoiceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private ref;
    createFromQuoteTx(tx: Prisma.TransactionClient, quote: QuoteForInvoice): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        clientId: string;
        listingId: string | null;
        total: Prisma.Decimal;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        eventId: string | null;
        notes: string | null;
        bookingId: string | null;
        invoiceNumber: string;
        quoteId: string | null;
        conversationId: string;
        subtotal: Prisma.Decimal;
        issuedAt: Date;
    }>;
    createDirectInvoiceTx(tx: Prisma.TransactionClient, args: {
        booking: {
            id: string;
            clientId: string;
            vendorId: string;
            eventId: string | null;
            listingId: string;
        };
        conversationId: string;
        lineItems: {
            label: string;
            amount: number;
        }[];
        paymentTerms?: string | null;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        clientId: string;
        listingId: string | null;
        total: Prisma.Decimal;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        eventId: string | null;
        notes: string | null;
        bookingId: string | null;
        invoiceNumber: string;
        quoteId: string | null;
        conversationId: string;
        subtotal: Prisma.Decimal;
        issuedAt: Date;
    }>;
}
