import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Prisma.PrismaPromise<{
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
    findAllAdmin(): Prisma.PrismaPromise<({
        _count: {
            listings: number;
            children: number;
        };
        parent: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        description: string | null;
        tags: string[];
        isActive: boolean;
        createdAt: Date;
        name: string;
        slug: string;
        metadata: Prisma.JsonValue | null;
        updatedAt: Date;
        sortOrder: number;
        iconUrl: string | null;
        imageUrl: string | null;
        color: string | null;
        keywords: string[];
        featured: boolean;
        popularityScore: number;
        parentId: string | null;
    })[]>;
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
            metadata: Prisma.JsonValue | null;
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
        metadata: Prisma.JsonValue | null;
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
    create(dto: CreateCategoryDto): Prisma.Prisma__CategoryClient<{
        id: string;
        description: string | null;
        tags: string[];
        isActive: boolean;
        createdAt: Date;
        name: string;
        slug: string;
        metadata: Prisma.JsonValue | null;
        updatedAt: Date;
        sortOrder: number;
        iconUrl: string | null;
        imageUrl: string | null;
        color: string | null;
        keywords: string[];
        featured: boolean;
        popularityScore: number;
        parentId: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        description: string | null;
        tags: string[];
        isActive: boolean;
        createdAt: Date;
        name: string;
        slug: string;
        metadata: Prisma.JsonValue | null;
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
    remove(id: string): Promise<{
        id: string;
        description: string | null;
        tags: string[];
        isActive: boolean;
        createdAt: Date;
        name: string;
        slug: string;
        metadata: Prisma.JsonValue | null;
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
