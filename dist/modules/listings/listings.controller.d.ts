import { MediaType } from '@prisma/client';
import type { Request } from 'express';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingsService } from './listings.service';
declare class AddMediaDto {
    url: string;
    publicId?: string;
    type: MediaType;
    sortOrder?: number;
}
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    create(req: Request, dto: CreateListingDto): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        };
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        location: import("@prisma/client/runtime/client").JsonValue;
        vendorId: string;
        reviewCount: number;
        isRentable: boolean;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        media: {
            type: import("@prisma/client").$Enums.MediaType;
            url: string;
            publicId: string | null;
            id: string;
            sortOrder: number;
        }[];
    }>;
    findAll(req: Request): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        };
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        location: import("@prisma/client/runtime/client").JsonValue;
        vendorId: string;
        reviewCount: number;
        isRentable: boolean;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        media: {
            type: import("@prisma/client").$Enums.MediaType;
            url: string;
            publicId: string | null;
            id: string;
            sortOrder: number;
        }[];
    }[]>;
    findOne(id: string): Promise<{}>;
    update(id: string, req: Request, dto: UpdateListingDto): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
        };
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        description: string;
        title: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        location: import("@prisma/client/runtime/client").JsonValue;
        vendorId: string;
        reviewCount: number;
        isRentable: boolean;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        media: {
            type: import("@prisma/client").$Enums.MediaType;
            url: string;
            publicId: string | null;
            id: string;
            sortOrder: number;
        }[];
    }>;
    remove(id: string, req: Request): Promise<{
        id: string;
        isActive: boolean;
    }>;
    addMedia(id: string, req: Request, body: AddMediaDto): Promise<{
        type: import("@prisma/client").$Enums.MediaType;
        url: string;
        publicId: string | null;
        id: string;
        createdAt: Date;
        sortOrder: number;
        listingId: string;
    }>;
    removeMedia(mediaId: string, req: Request): Promise<{
        publicId: string | null;
    }>;
}
export {};
