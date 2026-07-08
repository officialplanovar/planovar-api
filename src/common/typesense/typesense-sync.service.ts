import { Inject, Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { Client } from 'typesense';
import { PrismaService } from '../../prisma/prisma.service';
import { TYPESENSE_CLIENT } from './typesense.provider';
import { LISTINGS_COLLECTION, listingsSchema } from './schemas/listings.schema';
import { VENDORS_COLLECTION, vendorsSchema } from './schemas/vendors.schema';
import { EVENTS_COLLECTION, eventsSchema } from './schemas/events.schema';

@Injectable()
export class TypesenseSyncService implements OnModuleInit {
  private readonly logger = new Logger(TypesenseSyncService.name);

  constructor(
    @Inject(TYPESENSE_CLIENT) private readonly typesense: Client,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureCollections();
      this.logger.log('Typesense collections ready');
    } catch (err) {
      // Don't crash the server if Typesense is unavailable at startup
      this.logger.warn('Typesense unavailable at startup — search will fail until it comes online');
    }
  }

  async ensureCollections(): Promise<void> {
    for (const schema of [listingsSchema, vendorsSchema, eventsSchema]) {
      try {
        await this.typesense.collections().create(schema);
      } catch (err: any) {
        // 409 = already exists → reconcile the schema (additive migration).
        if (err?.httpStatus === 409) {
          await this.reconcileSchema(schema);
        } else {
          console.error(`[Typesense] Failed to create collection ${schema.name}:`, err);
        }
      }
    }
  }

  /**
   * Add any fields present in the code schema but missing from the live Typesense
   * collection (e.g. a newly-added `vendorVerified`). Only ADDS fields — it never
   * drops or retypes existing ones, so it's non-destructive. Existing documents
   * get the new field as null until they're re-indexed (run POST /search/admin/sync).
   */
  private async reconcileSchema(schema: {
    name: string;
    fields: readonly any[];
  }): Promise<void> {
    try {
      const live = await this.typesense.collections(schema.name).retrieve();
      const liveFields = new Set((live.fields ?? []).map((f: any) => f.name));
      const missing = schema.fields.filter((f) => !liveFields.has(f.name));
      if (missing.length === 0) return;
      await this.typesense
        .collections(schema.name)
        .update({ fields: missing as any });
      this.logger.log(
        `Typesense: added field(s) to ${schema.name}: ${missing
          .map((f) => f.name)
          .join(', ')}`,
      );
    } catch (err) {
      console.error(`[Typesense] Failed to reconcile ${schema.name} schema:`, err);
    }
  }

  // ─── Listings ──────────────────────────────────────────────────────────────

  async indexListing(listing: any): Promise<void> {
    try {
      const doc = this.transformListing(listing);
      await this.typesense
        .collections(LISTINGS_COLLECTION)
        .documents()
        .upsert(doc);
    } catch (err) {
      console.error('[Typesense] Failed to index listing:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  async deleteListing(id: string): Promise<void> {
    try {
      await this.typesense
        .collections(LISTINGS_COLLECTION)
        .documents(id)
        .delete();
    } catch (err) {
      console.error('[Typesense] Failed to delete listing:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  async bulkSyncListings(): Promise<void> {
    try {
      const listings = await this.prisma.listing.findMany({
        where: { isActive: true },
        include: {
          vendor: true,
          media: { where: { type: 'IMAGE' }, orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      });

      if (listings.length === 0) return;

      const docs = listings.map((l) => this.transformListing(l));
      await this.typesense
        .collections(LISTINGS_COLLECTION)
        .documents()
        .import(docs, { action: 'upsert' });
    } catch (err) {
      console.error('[Typesense] bulkSyncListings failed:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  /**
   * Re-index a vendor and all its active listings — call after KYC approval so
   * `isVerified` / `vendorVerified` flip and the vendor + services become
   * discoverable to clients. Best-effort: never throws.
   */
  async reindexVendorAndListings(vendorId: string): Promise<void> {
    try {
      const vendor = await this.prisma.vendorProfile.findUnique({
        where: { id: vendorId },
      });
      if (vendor) await this.indexVendor(vendor);

      const listings = await this.prisma.listing.findMany({
        where: { vendorId, isActive: true },
        include: {
          vendor: true,
          media: {
            where: { type: 'IMAGE' },
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
      });
      for (const l of listings) {
        await this.indexListing(l);
      }
    } catch (err) {
      console.error('[Typesense] reindexVendorAndListings failed:', err);
    }
  }

  private transformListing(listing: any): Record<string, any> {
    const vendor = listing.vendor ?? {};
    const locationJson = listing.location as any;

    // Build geopoint [lat, lng] if available
    let geopoint: [number, number] | undefined;
    if (locationJson?.lat != null && locationJson?.lng != null) {
      geopoint = [Number(locationJson.lat), Number(locationJson.lng)];
    }

    // Pick cover image — first IMAGE media or undefined
    const coverImage: string | undefined =
      listing.media?.[0]?.url ?? undefined;

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      pricingType: listing.pricingType,
      priceMin: listing.basePrice != null ? Number(listing.basePrice) : undefined,
      priceMax: listing.basePrice != null ? Number(listing.basePrice) : undefined,
      categoryId: listing.categoryId ?? undefined,
      tags: listing.tags ?? [],
      ...(geopoint ? { location: geopoint } : {}),
      city: locationJson?.city ?? undefined,
      country: locationJson?.country ?? undefined,
      vendorId: listing.vendorId,
      vendorName: vendor.businessName ?? '',
      vendorSlug: vendor.slug ?? '',
      vendorTier: vendor.subscriptionTier ?? 'BASIC',
      // Clients only see listings from verified vendors (flips on KYC approval).
      vendorVerified: vendor.isVerified ?? false,
      rating: Number(listing.ratingAvg ?? 0),
      reviewCount: listing.reviewCount ?? 0,
      isActive: listing.isActive,
      isRentable: listing.isRentable ?? false,
      createdAt: new Date(listing.createdAt).getTime(),
      ...(coverImage ? { coverImage } : {}),
    };
  }

  // ─── Vendors ───────────────────────────────────────────────────────────────

  async indexVendor(vendor: any): Promise<void> {
    try {
      const doc = this.transformVendor(vendor);
      await this.typesense
        .collections(VENDORS_COLLECTION)
        .documents()
        .upsert(doc);
    } catch (err) {
      console.error('[Typesense] Failed to index vendor:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  async deleteVendor(id: string): Promise<void> {
    try {
      await this.typesense
        .collections(VENDORS_COLLECTION)
        .documents(id)
        .delete();
    } catch (err) {
      console.error('[Typesense] Failed to delete vendor:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  async bulkSyncVendors(): Promise<void> {
    try {
      const vendors = await this.prisma.vendorProfile.findMany();

      if (vendors.length === 0) return;

      const docs = vendors.map((v) => this.transformVendor(v));
      await this.typesense
        .collections(VENDORS_COLLECTION)
        .documents()
        .import(docs, { action: 'upsert' });
    } catch (err) {
      console.error('[Typesense] bulkSyncVendors failed:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  private transformVendor(vendor: any): Record<string, any> {
    const locationJson = vendor.location as any;

    let geopoint: [number, number] | undefined;
    if (locationJson?.lat != null && locationJson?.lng != null) {
      geopoint = [Number(locationJson.lat), Number(locationJson.lng)];
    }

    return {
      id: vendor.id,
      name: vendor.businessName,
      slug: vendor.slug,
      description: vendor.description ?? undefined,
      tags: vendor.tags ?? [],
      ...(geopoint ? { location: geopoint } : {}),
      city: locationJson?.city ?? undefined,
      country: locationJson?.country ?? undefined,
      ratingAvg: Number(vendor.ratingAvg ?? 0),
      reviewCount: vendor.reviewCount ?? 0,
      subscriptionTier: vendor.subscriptionTier ?? 'BASIC',
      isVerified: vendor.isVerified ?? false,
      // Cover image for search cards; fall back to the logo so tiles aren't blank.
      ...(vendor.coverUrl || vendor.logoUrl
        ? { coverUrl: vendor.coverUrl ?? vendor.logoUrl }
        : {}),
      createdAt: new Date(vendor.createdAt).getTime(),
    };
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  async indexEvent(event: any): Promise<void> {
    try {
      const doc = this.transformEvent(event);
      await this.typesense
        .collections(EVENTS_COLLECTION)
        .documents()
        .upsert(doc);
    } catch (err) {
      console.error('[Typesense] Failed to index event:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await this.typesense
        .collections(EVENTS_COLLECTION)
        .documents(id)
        .delete();
    } catch (err) {
      console.error('[Typesense] Failed to delete event:', err);
      throw new ServiceUnavailableException('Search service unavailable');
    }
  }

  private transformEvent(event: any): Record<string, any> {
    const locationJson = event.location as any;

    return {
      id: event.id,
      name: event.name,
      eventDate: event.eventDate ? new Date(event.eventDate).getTime() : undefined,
      budgetMin: event.budgetMin != null ? Number(event.budgetMin) : undefined,
      budgetMax: event.budgetMax != null ? Number(event.budgetMax) : undefined,
      clientId: event.clientId,
      city: locationJson?.city ?? undefined,
      country: locationJson?.country ?? undefined,
      createdAt: new Date(event.createdAt).getTime(),
    };
  }
}
