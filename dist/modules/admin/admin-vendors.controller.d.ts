import type { Request } from 'express';
import { VendorsService } from '../vendors/vendors.service';
import { ReviewKycDto } from '../vendors/dto/review-kyc.dto';
import { AdminService } from './admin.service';
import { AuditService } from '../../common/audit/audit.service';
import { VendorQueryDto } from './dto/admin-query.dto';
export declare class AdminVendorsController {
    private readonly vendorsService;
    private readonly admin;
    private readonly audit;
    constructor(vendorsService: VendorsService, admin: AdminService, audit: AuditService);
    list(query: VendorQueryDto): Promise<{
        data: {
            id: string;
            createdAt: Date;
            slug: string;
            businessName: string;
            businessType: import("@prisma/client").$Enums.VendorBusinessType | null;
            vendorType: import("@prisma/client").$Enums.VendorType;
            location: import("@prisma/client/runtime/client").JsonValue;
            tags: string[];
            ratingAvg: import("@prisma/client-runtime-utils").Decimal;
            reviewCount: number;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            kycSubmittedAt: Date | null;
            isVerified: boolean;
            user: {
                id: string;
                name: string;
                phone: string | null;
                email: string;
                isActive: boolean;
            };
        }[];
        meta: {
            total: number;
            take: number;
            skip: number;
        };
    }>;
    listPendingKyc(): Promise<{
        id: string;
        slug: string;
        businessName: string;
        businessType: import("@prisma/client").$Enums.VendorBusinessType | null;
        location: import("@prisma/client/runtime/client").JsonValue;
        ninDocumentUrl: string | null;
        cacDocumentUrl: string | null;
        kycSubmittedAt: Date | null;
    }[]>;
    reviewKyc(req: Request, id: string, dto: ReviewKycDto): Promise<{
        id: string;
        kycStatus: import("@prisma/client").$Enums.KycStatus;
        kycReviewedAt: Date | null;
        kycRejectionReason: string | null;
        isVerified: boolean;
    }>;
}
