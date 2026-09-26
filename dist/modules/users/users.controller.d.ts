import type { Request } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetPreferencesDto } from './dto/set-preferences.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: Request): Promise<{
        id: string;
        image: string | null;
        isActive: boolean;
        createdAt: Date;
        name: string;
        vendorProfile: {
            id: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
        } | null;
        phone: string | null;
        email: string;
        emailVerified: boolean;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string | null;
        lastName: string | null;
        notificationPrefs: import("@prisma/client/runtime/client").JsonValue;
        deletedAt: Date | null;
        clientProfile: {
            id: string;
            onboardingComplete: boolean;
            preferredCountry: {
                id: string;
                name: string;
                code: string;
                dialCode: string;
                flagEmoji: string | null;
            } | null;
            preferredCity: {
                id: string;
                name: string;
                state: string | null;
                latitude: import("@prisma/client-runtime-utils").Decimal;
                longitude: import("@prisma/client-runtime-utils").Decimal;
            } | null;
            categoryPrefs: {
                category: {
                    id: string;
                    name: string;
                    slug: string;
                    iconUrl: string | null;
                    imageUrl: string | null;
                };
            }[];
        } | null;
    }>;
    updateMe(req: Request, dto: UpdateProfileDto): Promise<{
        id: string;
        image: string | null;
        isActive: boolean;
        createdAt: Date;
        name: string;
        vendorProfile: {
            id: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
        } | null;
        phone: string | null;
        email: string;
        emailVerified: boolean;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string | null;
        lastName: string | null;
        notificationPrefs: import("@prisma/client/runtime/client").JsonValue;
        deletedAt: Date | null;
        clientProfile: {
            id: string;
            onboardingComplete: boolean;
            preferredCountry: {
                id: string;
                name: string;
                code: string;
                dialCode: string;
                flagEmoji: string | null;
            } | null;
            preferredCity: {
                id: string;
                name: string;
                state: string | null;
                latitude: import("@prisma/client-runtime-utils").Decimal;
                longitude: import("@prisma/client-runtime-utils").Decimal;
            } | null;
            categoryPrefs: {
                category: {
                    id: string;
                    name: string;
                    slug: string;
                    iconUrl: string | null;
                    imageUrl: string | null;
                };
            }[];
        } | null;
    }>;
    setPreferences(req: Request, dto: SetPreferencesDto): Promise<{
        id: string;
        image: string | null;
        isActive: boolean;
        createdAt: Date;
        name: string;
        vendorProfile: {
            id: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
        } | null;
        phone: string | null;
        email: string;
        emailVerified: boolean;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string | null;
        lastName: string | null;
        notificationPrefs: import("@prisma/client/runtime/client").JsonValue;
        deletedAt: Date | null;
        clientProfile: {
            id: string;
            onboardingComplete: boolean;
            preferredCountry: {
                id: string;
                name: string;
                code: string;
                dialCode: string;
                flagEmoji: string | null;
            } | null;
            preferredCity: {
                id: string;
                name: string;
                state: string | null;
                latitude: import("@prisma/client-runtime-utils").Decimal;
                longitude: import("@prisma/client-runtime-utils").Decimal;
            } | null;
            categoryPrefs: {
                category: {
                    id: string;
                    name: string;
                    slug: string;
                    iconUrl: string | null;
                    imageUrl: string | null;
                };
            }[];
        } | null;
    }>;
    deleteMe(req: Request): Promise<{
        deleted: boolean;
    }>;
    deactivateMe(req: Request): Promise<{
        deactivated: boolean;
    }>;
    updateNotificationPrefs(req: Request, body: Record<string, unknown>): Promise<string | number | boolean | import("@prisma/client/runtime/client").JsonObject | import("@prisma/client/runtime/client").JsonArray>;
    registerDeviceToken(req: Request, body: {
        token: string;
        platform: string;
    }): Promise<{
        registered: boolean;
    }>;
    removeDeviceToken(req: Request, token: string): Promise<{
        removed: boolean;
    }>;
    listFavourites(req: Request): Promise<{
        listing: {
            vendor: {
                id: string;
                slug: string;
                subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
                isVerified: boolean;
                businessName: string;
            };
            id: string;
            title: string;
            pricingType: import("@prisma/client").$Enums.PricingType;
            tags: string[];
            reviewCount: number;
            isActive: boolean;
            ratingAvg: import("@prisma/client-runtime-utils").Decimal;
            basePrice: import("@prisma/client-runtime-utils").Decimal | null;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            media: {
                id: string;
                type: import("@prisma/client").$Enums.MediaType;
                url: string;
            }[];
        };
    }[]>;
    listVendorFavourites(req: Request): Promise<({
        id: string;
        description: string | null;
        tags: string[];
        location: import("@prisma/client/runtime/client").JsonValue;
        reviewCount: number;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        slug: string;
        subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
        isVerified: boolean;
        coverUrl: string | null;
        businessName: string;
        logoUrl: string | null;
    } | undefined)[]>;
    addVendorFavourite(req: Request, vendorId: string): Promise<{
        favourited: boolean;
    }>;
    removeVendorFavourite(req: Request, vendorId: string): Promise<{
        favourited: boolean;
    }>;
    addFavourite(req: Request, listingId: string): Promise<{
        favourited: boolean;
    }>;
    removeFavourite(req: Request, listingId: string): Promise<{
        favourited: boolean;
    }>;
}
