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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        tags: string[];
        vendorId: string;
        description: string;
        location: import("@prisma/client/runtime/client").JsonValue;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        reviewCount: number;
        title: string;
        categoryId: string;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        pricingType: import("@prisma/client").$Enums.PricingType;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        isRentable: boolean;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        media: {
            url: string;
            type: import("@prisma/client").$Enums.MediaType;
            id: string;
            publicId: string | null;
            sortOrder: number;
        }[];
    }>;
    findAll(req: Request): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        tags: string[];
        vendorId: string;
        description: string;
        location: import("@prisma/client/runtime/client").JsonValue;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        reviewCount: number;
        title: string;
        categoryId: string;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        pricingType: import("@prisma/client").$Enums.PricingType;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        isRentable: boolean;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        media: {
            url: string;
            type: import("@prisma/client").$Enums.MediaType;
            id: string;
            publicId: string | null;
            sortOrder: number;
        }[];
    }[]>;
    browse(pricingType?: string, categoryId?: string, isRentable?: string, take?: string, skip?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        tags: string[];
        vendorId: string;
        description: string;
        location: import("@prisma/client/runtime/client").JsonValue;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        reviewCount: number;
        title: string;
        categoryId: string;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        pricingType: import("@prisma/client").$Enums.PricingType;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        isRentable: boolean;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        media: {
            url: string;
            type: import("@prisma/client").$Enums.MediaType;
            id: string;
            publicId: string | null;
            sortOrder: number;
        }[];
    }[]>;
    findOne(id: string): Promise<{}>;
    recordView(id: string): Promise<{
        id: string;
        viewCount: number;
    }>;
    update(id: string, req: Request, dto: UpdateListingDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        tags: string[];
        vendorId: string;
        description: string;
        location: import("@prisma/client/runtime/client").JsonValue;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        reviewCount: number;
        title: string;
        categoryId: string;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        pricingType: import("@prisma/client").$Enums.PricingType;
        basePrice: import("@prisma/client-runtime-utils").Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        isRentable: boolean;
        perDayRate: import("@prisma/client-runtime-utils").Decimal | null;
        depositAmount: import("@prisma/client-runtime-utils").Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        media: {
            url: string;
            type: import("@prisma/client").$Enums.MediaType;
            id: string;
            publicId: string | null;
            sortOrder: number;
        }[];
    }>;
    remove(id: string, req: Request): Promise<{
        id: string;
        deleted: boolean;
    }>;
    addMedia(id: string, req: Request, body: AddMediaDto): Promise<{
        url: string;
        type: import("@prisma/client").$Enums.MediaType;
        id: string;
        createdAt: Date;
        publicId: string | null;
        sortOrder: number;
        listingId: string;
    }>;
    removeMedia(mediaId: string, req: Request): Promise<{
        publicId: string | null;
    }>;
}
export {};
