import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { EmailService } from '../../common/email/email.service';
import { RedisService } from '../../common/redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
export declare class PaymentsService {
    private readonly prisma;
    private readonly redis;
    private readonly config;
    private readonly email;
    private readonly subscriptions;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService, config: ConfigService, email: EmailService, subscriptions: SubscriptionsService);
    initiatePayment(userId: string, dto: InitiatePaymentDto): Promise<{
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
    handlePaystackWebhook(rawBody: Buffer, signature: string): Promise<void>;
    handleFlutterwaveWebhook(rawBody: Buffer, signature: string): Promise<void>;
    private processSuccessfulPayment;
    getInstallmentsForBooking(bookingId: string, userId: string): Promise<{
        type: import("@prisma/client").$Enums.InstallmentType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        status: import("@prisma/client").$Enums.InstallmentStatus;
        amount: Prisma.Decimal;
        quoteId: string;
        label: string;
        percentage: Prisma.Decimal;
        dueAt: Date | null;
        paidAt: Date | null;
    }[]>;
    releaseEscrow(escrowHoldId: string, userId: string): Promise<{
        escrowHold: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.EscrowStatus;
            bookingId: string;
            amount: Prisma.Decimal;
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
    getTransactionHistory(userId: string, take?: number, skip?: number): Promise<{
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
            metadata: Prisma.JsonValue | null;
            currency: string;
            bookingId: string | null;
            amount: Prisma.Decimal;
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
}
