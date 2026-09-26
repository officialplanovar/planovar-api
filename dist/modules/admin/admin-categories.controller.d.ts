import type { Request } from 'express';
import { CategoriesService } from '../categories/categories.service';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto';
import { AuditService } from '../../common/audit/audit.service';
export declare class AdminCategoriesController {
    private readonly categoriesService;
    private readonly audit;
    constructor(categoriesService: CategoriesService, audit: AuditService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            listings: number;
            children: number;
        };
        parent: {
            id: string;
            name: string;
        } | null;
    } & {
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        tags: string[];
        slug: string;
        description: string | null;
        iconUrl: string | null;
        imageUrl: string | null;
        color: string | null;
        keywords: string[];
        featured: boolean;
        popularityScore: number;
        sortOrder: number;
        parentId: string | null;
    })[]>;
    create(req: Request, dto: CreateCategoryDto): Promise<{
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        tags: string[];
        slug: string;
        description: string | null;
        iconUrl: string | null;
        imageUrl: string | null;
        color: string | null;
        keywords: string[];
        featured: boolean;
        popularityScore: number;
        sortOrder: number;
        parentId: string | null;
    }>;
    update(req: Request, id: string, dto: UpdateCategoryDto): Promise<{
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        tags: string[];
        slug: string;
        description: string | null;
        iconUrl: string | null;
        imageUrl: string | null;
        color: string | null;
        keywords: string[];
        featured: boolean;
        popularityScore: number;
        sortOrder: number;
        parentId: string | null;
    }>;
    remove(req: Request, id: string): Promise<{
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        tags: string[];
        slug: string;
        description: string | null;
        iconUrl: string | null;
        imageUrl: string | null;
        color: string | null;
        keywords: string[];
        featured: boolean;
        popularityScore: number;
        sortOrder: number;
        parentId: string | null;
    }>;
}
