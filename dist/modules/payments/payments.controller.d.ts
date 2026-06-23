import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    initiatePayment(req: Request, dto: InitiatePaymentDto): Promise<{
        authorizationUrl: string;
        reference: string;
        transactionId: string;
    }>;
    verifyPayment(dto: VerifyPaymentDto): Promise<{
        provider: string;
        status: string;
        data: {
            status: string;
            amount: number;
            currency: string;
        };
    }>;
    getTransactionHistory(req: Request, take?: string, skip?: string): Promise<{
        data: ({
            booking: {
                id: string;
                eventDate: Date;
            } | null;
            installment: {
                type: import("@prisma/client").$Enums.InstallmentType;
                id: string;
                label: string;
            } | null;
        } & {
            type: import("@prisma/client").$Enums.TransactionType;
            id: string;
            currency: string;
            createdAt: Date;
            userId: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            paystackReference: string | null;
            flutterwaveReference: string | null;
            paystackStatus: string | null;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            bookingId: string | null;
            installmentId: string | null;
        })[];
        meta: {
            total: number;
            take: number;
            skip: number;
            hasMore: boolean;
        };
    }>;
    getInstallments(req: Request, bookingId: string): Promise<{
        type: import("@prisma/client").$Enums.InstallmentType;
        status: import("@prisma/client").$Enums.InstallmentStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        quoteId: string;
        label: string;
        percentage: import("@prisma/client-runtime-utils").Decimal;
        dueAt: Date | null;
        paidAt: Date | null;
        sortOrder: number;
    }[]>;
    releaseEscrow(req: Request, holdId: string): Promise<{
        escrowHold: {
            status: import("@prisma/client").$Enums.EscrowStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: import("@prisma/client-runtime-utils").Decimal;
            bookingId: string;
            installmentId: string | null;
            heldAt: Date;
            releasedAt: Date | null;
            releasedBy: string | null;
            releaseReason: string | null;
        };
        payout: {
            id: string;
            amount: number;
            scheduledAt: Date;
        };
    }>;
    paystackWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
    flutterwaveWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
