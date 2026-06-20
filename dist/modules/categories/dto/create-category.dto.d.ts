export declare class CreateCategoryDto {
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    imageUrl?: string;
    color?: string;
    tags?: string[];
    keywords?: string[];
    featured?: boolean;
    popularityScore?: number;
    metadata?: Record<string, unknown>;
    sortOrder?: number;
    isActive?: boolean;
    parentId?: string;
}
