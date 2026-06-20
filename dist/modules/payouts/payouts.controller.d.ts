import type { Request } from 'express';
import { PayoutsService } from './payouts.service';
import { UpdateBankDetailsDto } from './dto/update-bank-details.dto';
export declare class PayoutsController {
    private readonly payoutsService;
    constructor(payoutsService: PayoutsService);
    listForVendor(req: Request): Promise<{
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
    getOne(req: Request, id: string): Promise<{
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
    updateBankDetails(req: Request, dto: UpdateBankDetailsDto): Promise<{
        id: string;
        bankCode: string | null;
        bankAccount: string | null;
        paystackRecipientCode: string | null;
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
    processPayout(id: string): Promise<string>;
}
