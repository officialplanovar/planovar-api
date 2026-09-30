import { KycStatus, SubscriptionStatus, SubscriptionTier, UserRole } from '@prisma/client';
declare class PaginationDto {
    take?: number;
    skip?: number;
    search?: string;
}
export declare class VendorQueryDto extends PaginationDto {
    kycStatus?: KycStatus;
    tier?: SubscriptionTier;
}
export declare class UserQueryDto extends PaginationDto {
    role?: UserRole;
    isActive?: boolean;
}
export declare class SubscriptionQueryDto extends PaginationDto {
    status?: SubscriptionStatus;
    tier?: SubscriptionTier;
}
export declare class AuditQueryDto extends PaginationDto {
    resourceType?: string;
    action?: string;
}
export {};
