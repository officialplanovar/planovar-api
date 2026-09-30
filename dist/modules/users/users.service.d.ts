import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetPreferencesDto } from './dto/set-preferences.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
        vendorProfile: {
            id: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
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
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
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
        image: string | null;
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        isActive: boolean;
        notificationPrefs: Prisma.JsonValue;
        deletedAt: Date | null;
    }>;
    updateNotificationPrefs(userId: string, prefs: Record<string, unknown>): Promise<string | number | boolean | Prisma.JsonObject | Prisma.JsonArray>;
    deactivateMe(userId: string): Promise<{
        deactivated: boolean;
    }>;
    updateMe(userId: string, dto: UpdateProfileDto): Promise<{
        vendorProfile: {
            id: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
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
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
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
        image: string | null;
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        isActive: boolean;
        notificationPrefs: Prisma.JsonValue;
        deletedAt: Date | null;
    }>;
    deleteMe(userId: string): Promise<{
        deleted: boolean;
    }>;
    setPreferences(userId: string, dto: SetPreferencesDto): Promise<{
        vendorProfile: {
            id: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
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
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
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
        image: string | null;
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        isActive: boolean;
        notificationPrefs: Prisma.JsonValue;
        deletedAt: Date | null;
    }>;
    completeOnboarding(userId: string): Promise<{
        vendorProfile: {
            id: string;
            subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
            kycStatus: import("@prisma/client").$Enums.KycStatus;
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
                latitude: Prisma.Decimal;
                longitude: Prisma.Decimal;
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
        image: string | null;
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
        firstName: string | null;
        lastName: string | null;
        isActive: boolean;
        notificationPrefs: Prisma.JsonValue;
        deletedAt: Date | null;
    }>;
    registerDeviceToken(userId: string, token: string, platform: string): Promise<{
        registered: boolean;
    }>;
    removeDeviceToken(userId: string, token: string): Promise<{
        removed: boolean;
    }>;
    addFavourite(userId: string, listingId: string): Promise<{
        favourited: boolean;
    }>;
    removeFavourite(userId: string, listingId: string): Promise<{
        favourited: boolean;
    }>;
    addVendorFavourite(userId: string, vendorId: string): Promise<{
        favourited: boolean;
    }>;
    removeVendorFavourite(userId: string, vendorId: string): Promise<{
        favourited: boolean;
    }>;
    listVendorFavourites(userId: string): Promise<({
        description: string | null;
        tags: string[];
        id: string;
        location: Prisma.JsonValue;
        reviewCount: number;
        ratingAvg: Prisma.Decimal;
        slug: string;
        subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
        isVerified: boolean;
        coverUrl: string | null;
        businessName: string;
        logoUrl: string | null;
    } | undefined)[]>;
    listFavourites(userId: string): Promise<{
        listing: {
            category: {
                id: string;
                name: string;
                slug: string;
            };
            tags: string[];
            vendor: {
                id: string;
                slug: string;
                subscriptionTier: import("@prisma/client").$Enums.SubscriptionTier;
                isVerified: boolean;
                businessName: string;
            };
            id: string;
            isActive: boolean;
            title: string;
            pricingType: import("@prisma/client").$Enums.PricingType;
            reviewCount: number;
            ratingAvg: Prisma.Decimal;
            basePrice: Prisma.Decimal | null;
            media: {
                type: import("@prisma/client").$Enums.MediaType;
                url: string;
                id: string;
            }[];
        };
    }[]>;
}
