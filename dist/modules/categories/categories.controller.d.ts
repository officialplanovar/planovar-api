import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        tags: string[];
        id: string;
        name: string;
        description: string | null;
        slug: string;
        sortOrder: number;
        iconUrl: string | null;
        imageUrl: string | null;
        color: string | null;
        featured: boolean;
        children: {
            tags: string[];
            id: string;
            name: string;
            description: string | null;
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
            tags: string[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            metadata: import("@prisma/client/runtime/client").JsonValue | null;
            description: string | null;
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
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        description: string | null;
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
