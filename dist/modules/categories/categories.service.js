"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const PUBLIC_SELECT = {
    id: true,
    name: true,
    slug: true,
    description: true,
    iconUrl: true,
    imageUrl: true,
    color: true,
    tags: true,
    featured: true,
};
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.category.findMany({
            where: { isActive: true, parentId: null },
            orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
            select: {
                ...PUBLIC_SELECT,
                sortOrder: true,
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                    select: PUBLIC_SELECT,
                },
            },
        });
    }
    findAllAdmin() {
        return this.prisma.category.findMany({
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: {
                parent: { select: { id: true, name: true } },
                _count: { select: { listings: true, children: true } },
            },
        });
    }
    async findOne(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                },
                _count: { select: { listings: true, children: true } },
            },
        });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return category;
    }
    create(dto) {
        return this.prisma.category.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                iconUrl: dto.iconUrl,
                imageUrl: dto.imageUrl,
                color: dto.color,
                tags: dto.tags ?? [],
                keywords: dto.keywords ?? [],
                featured: dto.featured ?? false,
                popularityScore: dto.popularityScore ?? 0,
                metadata: (dto.metadata ?? undefined),
                sortOrder: dto.sortOrder ?? 0,
                isActive: dto.isActive ?? true,
                parentId: dto.parentId ?? null,
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        const { metadata, ...rest } = dto;
        return this.prisma.category.update({
            where: { id },
            data: {
                ...rest,
                ...(metadata !== undefined && { metadata: metadata }),
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.category.update({
            where: { id },
            data: { isActive: false },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map