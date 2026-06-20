import { PricingType } from '@prisma/client';
export declare class UpdateListingDto {
    categoryId?: string;
    title?: string;
    description?: string;
    pricingType?: PricingType;
    basePrice?: number;
    location?: Record<string, unknown>;
    isActive?: boolean;
    isRentable?: boolean;
    perDayRate?: number;
    depositAmount?: number;
    tags?: string[];
}
