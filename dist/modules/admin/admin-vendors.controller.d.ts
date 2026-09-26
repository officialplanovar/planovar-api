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
            tags: string[];
            location: import("@prisma/client/runtime/client").JsonValue;
            reviewCount: number;
            createdAt: Date;
            ratingAvg: import("@prisma/client-runtime-utils").Decimal;
            slug: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            isVerified: boolean;
            businessName: string;
            businessType: import("@prisma/client").$Enums.VendorBusinessType | null;
            vendorType: import("@prisma/client").$Enums.VendorType;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            idDocumentUrl: string | null;
            idType: string | null;
            idCountry: string | null;
            businessRegDocumentUrl: string | null;
            businessRegCountry: string | null;
            kycSubmittedAt: Date | null;
            user: {
                id: string;
                isActive: boolean;
                name: string;
                phone: string | null;
                email: string;
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
        location: import("@prisma/client/runtime/client").JsonValue;
        slug: string;
        businessName: string;
        businessType: import("@prisma/client").$Enums.VendorBusinessType | null;
        idDocumentUrl: string | null;
        idType: string | null;
        idCountry: string | null;
        businessRegDocumentUrl: string | null;
        businessRegCountry: string | null;
        kycSubmittedAt: Date | null;
    }[]>;
    reviewKyc(req: Request, id: string, dto: ReviewKycDto): Promise<{
        id: string;
        isVerified: boolean;
        kycStatus: import("@prisma/client").$Enums.KycStatus;
        kycReviewedAt: Date | null;
        kycRejectionReason: string | null;
    }>;
}
