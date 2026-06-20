import { VendorBusinessType, VendorType } from '@prisma/client';
export declare class OnboardVendorDto {
    businessName: string;
    slug: string;
    businessType?: VendorBusinessType;
    vendorType?: VendorType;
    description?: string;
    logoUrl?: string;
    coverUrl?: string;
    phone?: string;
    email?: string;
    location?: Record<string, unknown>;
    serviceRadiusKm?: number;
    tags?: string[];
}
