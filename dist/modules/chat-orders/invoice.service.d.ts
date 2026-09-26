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
        vendorId: string;
        createdAt: Date;
        updatedAt: Date;
        listingId: string | null;
        clientId: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        total: Prisma.Decimal;
        notes: string | null;
        eventId: string | null;
        bookingId: string | null;
        conversationId: string;
        quoteId: string | null;
        invoiceNumber: string;
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
        vendorId: string;
        createdAt: Date;
        updatedAt: Date;
        listingId: string | null;
        clientId: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        total: Prisma.Decimal;
        notes: string | null;
        eventId: string | null;
        bookingId: string | null;
        conversationId: string;
        quoteId: string | null;
        invoiceNumber: string;
        subtotal: Prisma.Decimal;
        issuedAt: Date;
    }>;
}
