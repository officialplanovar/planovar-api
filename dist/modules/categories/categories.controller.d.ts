import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        description: string | null;
        tags: string[];
        name: string;
        slug: string;
        sortOrder: number;
        iconUrl: string | null;
        imageUrl: string | null;
        color: string | null;
        featured: boolean;
        children: {
            id: string;
            description: string | null;
            tags: string[];
            name: string;
            slug: string;
            iconUrl: string | null;
            imageUrl: string | null;
            color: string | null;
            featured: boolean;
        }[];
    }[]>;
    findOne(id: string): Promise<{
        _count: {
            listings: number;
            children: number;
        };
        children: {
            id: string;
            description: string | null;
            tags: string[];
            isActive: boolean;
            createdAt: Date;
            name: string;
            slug: string;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            updatedAt: Date;
            sortOrder: number;
            iconUrl: string | null;
            imageUrl: string | null;
            color: string | null;
            keywords: string[];
            featured: boolean;
            popularityScore: number;
            parentId: string | null;
        }[];
    } & {
        id: string;
        description: string | null;
        tags: string[];
        isActive: boolean;
        createdAt: Date;
        name: string;
        slug: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        updatedAt: Date;
        sortOrder: number;
        iconUrl: string | null;
        imageUrl: string | null;
        color: string | null;
        keywords: string[];
        featured: boolean;
        popularityScore: number;
        parentId: string | null;
    }>;
}
