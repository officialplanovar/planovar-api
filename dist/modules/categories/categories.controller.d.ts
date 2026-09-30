import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        description: string | null;
        tags: string[];
        id: string;
        name: string;
        slug: string;
        sortOrder: number;
        iconUrl: string | null;
        imageUrl: string | null;
        color: string | null;
        featured: boolean;
        children: {
            description: string | null;
            tags: string[];
            id: string;
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
            description: string | null;
            tags: string[];
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            slug: string;
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
        description: string | null;
        tags: string[];
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        slug: string;
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
