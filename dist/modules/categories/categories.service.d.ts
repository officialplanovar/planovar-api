import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Prisma.PrismaPromise<{
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
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        metadata: Prisma.JsonValue | null;
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
    })[]>;
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
            metadata: Prisma.JsonValue | null;
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
        metadata: Prisma.JsonValue | null;
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
    create(dto: CreateCategoryDto): Prisma.Prisma__CategoryClient<{
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        metadata: Prisma.JsonValue | null;
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, dto: UpdateCategoryDto): Promise<{
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        metadata: Prisma.JsonValue | null;
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
    remove(id: string): Promise<{
        tags: string[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        metadata: Prisma.JsonValue | null;
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
