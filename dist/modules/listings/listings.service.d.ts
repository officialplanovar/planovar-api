import { MediaType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { TypesenseSyncService } from '../../common/typesense/typesense-sync.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
interface AddMediaData {
    url: string;
    publicId?: string;
    type: MediaType;
    sortOrder?: number;
}
export declare class ListingsService {
    private readonly prisma;
    private readonly redis;
    private readonly sync;
    constructor(prisma: PrismaService, redis: RedisService, sync: TypesenseSyncService);
    create(userId: string, dto: CreateListingDto): Promise<{
        id: string;
        title: string;
        description: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        tags: string[];
        location: Prisma.JsonValue;
        vendorId: string;
        reviewCount: number;
        isActive: boolean;
        isRentable: boolean;
        createdAt: Date;
        ratingAvg: Prisma.Decimal;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            id: string;
            type: import("@prisma/client").$Enums.MediaType;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }>;
    private assertWithinListingLimit;
    findAllForUser(userId: string): Promise<{
        id: string;
        title: string;
        description: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        tags: string[];
        location: Prisma.JsonValue;
        vendorId: string;
        reviewCount: number;
        isActive: boolean;
        isRentable: boolean;
        createdAt: Date;
        ratingAvg: Prisma.Decimal;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            id: string;
            type: import("@prisma/client").$Enums.MediaType;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }[]>;
    findAll(vendorId: string): Promise<{
        id: string;
        title: string;
        description: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        tags: string[];
        location: Prisma.JsonValue;
        vendorId: string;
        reviewCount: number;
        isActive: boolean;
        isRentable: boolean;
        createdAt: Date;
        ratingAvg: Prisma.Decimal;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            id: string;
            type: import("@prisma/client").$Enums.MediaType;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }[]>;
    findOne(id: string): Promise<{}>;
    browse(opts: {
        pricingType?: string;
        categoryId?: string;
        isRentable?: boolean;
        take?: number;
        skip?: number;
    }): Promise<{
        id: string;
        title: string;
        description: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        tags: string[];
        location: Prisma.JsonValue;
        vendorId: string;
        reviewCount: number;
        isActive: boolean;
        isRentable: boolean;
        createdAt: Date;
        ratingAvg: Prisma.Decimal;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            id: string;
            type: import("@prisma/client").$Enums.MediaType;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }[]>;
    recordView(id: string): Promise<{
        id: string;
        viewCount: number;
    }>;
    update(id: string, userId: string, dto: UpdateListingDto): Promise<{
        id: string;
        title: string;
        description: string;
        pricingType: import("@prisma/client").$Enums.PricingType;
        categoryId: string;
        tags: string[];
        location: Prisma.JsonValue;
        vendorId: string;
        reviewCount: number;
        isActive: boolean;
        isRentable: boolean;
        createdAt: Date;
        ratingAvg: Prisma.Decimal;
        basePrice: Prisma.Decimal | null;
        isFeatured: boolean;
        viewCount: number;
        perDayRate: Prisma.Decimal | null;
        depositAmount: Prisma.Decimal | null;
        sku: string | null;
        stockQuantity: number | null;
        durationValue: number | null;
        durationUnit: string | null;
        cancellationPolicy: string | null;
        updatedAt: Date;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        media: {
            id: string;
            type: import("@prisma/client").$Enums.MediaType;
            sortOrder: number;
            url: string;
            publicId: string | null;
        }[];
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    addMedia(listingId: string, userId: string, mediaData: AddMediaData): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.MediaType;
        sortOrder: number;
        listingId: string;
        url: string;
        publicId: string | null;
    }>;
    removeMedia(mediaId: string, userId: string): Promise<{
        publicId: string | null;
    }>;
    private syncListingToSearch;
    private assertOwnership;
    private buildListingSelect;
}
export {};
