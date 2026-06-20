import { VendorBusinessType, VendorType } from '@prisma/client';
export declare class UpdateVendorDto {
    businessName?: string;
    slug?: string;
    businessType?: VendorBusinessType;
    vendorType?: VendorType;
    description?: string;
    phone?: string;
    email?: string;
    location?: Record<string, unknown>;
    serviceRadiusKm?: number;
    tags?: string[];
    logoUrl?: string;
    coverUrl?: string;
    portfolioUrls?: string[];
}
