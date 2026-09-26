import type { Request } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetPreferencesDto } from './dto/set-preferences.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: Request): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        image: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        isActive: boolean;
        notificationPrefs: import("@prisma/client/runtime/client").JsonValue;
        deletedAt: Date | null;
        vendorProfile: {
            id: string;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
        } | null;
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
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        image: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        isActive: boolean;
        notificationPrefs: import("@prisma/client/runtime/client").JsonValue;
        deletedAt: Date | null;
        vendorProfile: {
            id: string;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
        } | null;
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
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        image: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        isActive: boolean;
        notificationPrefs: import("@prisma/client/runtime/client").JsonValue;
        deletedAt: Date | null;
        vendorProfile: {
            id: string;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
        } | null;
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
            id: string;
            isActive: boolean;
            vendor: {
                id: string;
                businessName: string;
                slug: string;
                subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
                isVerified: boolean;
            };
            tags: string[];
            ratingAvg: import("@prisma/client-runtime-utils").Decimal;
            reviewCount: number;
            title: string;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            pricingType: import("@prisma/client").$Enums.PricingType;
            basePrice: import("@prisma/client-runtime-utils").Decimal | null;
            media: {
                url: string;
                type: import("@prisma/client").$Enums.MediaType;
                id: string;
            }[];
        };
    }[]>;
    listVendorFavourites(req: Request): Promise<({
        id: string;
        tags: string[];
        businessName: string;
        slug: string;
        description: string | null;
        logoUrl: string | null;
        coverUrl: string | null;
        location: import("@prisma/client/runtime/client").JsonValue;
        ratingAvg: import("@prisma/client-runtime-utils").Decimal;
        reviewCount: number;
        subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
        isVerified: boolean;
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
