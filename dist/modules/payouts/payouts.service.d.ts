import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateBankDetailsDto } from './dto/update-bank-details.dto';
export declare class PayoutsService {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaService, config: ConfigService);
    private get paystackSecret();
    private paystackHeaders;
    listForVendor(userId: string): Promise<{
        scheduledAt: Date;
        id: string;
        createdAt: Date;
        _count: {
            lineItems: number;
        };
        status: import("@prisma/client").$Enums.PayoutStatus;
        amount: import("@prisma/client-runtime-utils").Decimal;
        processedAt: Date | null;
        paystackTransferCode: string | null;
        failureReason: string | null;
    }[]>;
    getOne(payoutId: string, userId: string): Promise<{
        scheduledAt: Date;
        id: string;
        createdAt: Date;
        vendorId: string;
        status: import("@prisma/client").$Enums.PayoutStatus;
        amount: import("@prisma/client-runtime-utils").Decimal;
        lineItems: {
            transaction: {
                id: string;
                amount: import("@prisma/client-runtime-utils").Decimal;
                paystackReference: string | null;
            };
            id: string;
            commissionRate: import("@prisma/client-runtime-utils").Decimal;
            amount: import("@prisma/client-runtime-utils").Decimal;
        }[];
        processedAt: Date | null;
        paystackTransferCode: string | null;
        failureReason: string | null;
    }>;
    listPending(): Promise<{
        vendor: {
            user: {
                email: string;
                id: string;
                name: string;
            };
            id: string;
            businessName: string;
            bankCode: string | null;
            bankAccount: string | null;
            paystackRecipientCode: string | null;
        };
        scheduledAt: Date;
        id: string;
        createdAt: Date;
        _count: {
            lineItems: number;
        };
        status: import("@prisma/client").$Enums.PayoutStatus;
        amount: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    processPayout(payoutId: string): Promise<string>;
    updateBankDetails(userId: string, dto: UpdateBankDetailsDto): Promise<{
        id: string;
        bankCode: string | null;
        bankAccount: string | null;
        paystackRecipientCode: string | null;
    }>;
}
