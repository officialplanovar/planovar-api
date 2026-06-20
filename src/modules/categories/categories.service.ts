import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/** Presentation/taxonomy fields surfaced to the client apps & storefront. */
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
} satisfies Prisma.CategorySelect;

@Injectable()
export class CategoriesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

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

  /** Admin view: every category (incl. inactive) with listing-count metrics. */
  findAllAdmin() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { listings: true, children: true } },
      },
    });
  }

  async findOne(id: string) {
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
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  create(dto: CreateCategoryDto) {
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
        metadata: (dto.metadata ?? undefined) as Prisma.InputJsonValue,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        parentId: dto.parentId ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    const { metadata, ...rest } = dto;
    return this.prisma.category.update({
      where: { id },
      data: {
        ...rest,
        ...(metadata !== undefined && { metadata: metadata as Prisma.InputJsonValue }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
