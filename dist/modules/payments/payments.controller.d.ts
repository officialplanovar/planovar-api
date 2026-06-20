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
            createdAt: Date;
            userId: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            currency: string;
            bookingId: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
            installmentId: string | null;
            paystackReference: string | null;
            flutterwaveReference: string | null;
            paystackStatus: string | null;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        status: import("@prisma/client").$Enums.InstallmentStatus;
        amount: import("@prisma/client-runtime-utils").Decimal;
        quoteId: string;
        label: string;
        percentage: import("@prisma/client-runtime-utils").Decimal;
        dueAt: Date | null;
        paidAt: Date | null;
    }[]>;
    releaseEscrow(req: Request, holdId: string): Promise<{
        escrowHold: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.EscrowStatus;
            bookingId: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
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
