import { OnModuleInit } from '@nestjs/common';
import { Client } from 'typesense';
import { PrismaService } from '../../prisma/prisma.service';
export declare class TypesenseSyncService implements OnModuleInit {
    private readonly typesense;
    private readonly prisma;
    private readonly logger;
    constructor(typesense: Client, prisma: PrismaService);
    onModuleInit(): Promise<void>;
    ensureCollections(): Promise<void>;
    indexListing(listing: any): Promise<void>;
    deleteListing(id: string): Promise<void>;
    bulkSyncListings(): Promise<void>;
    private transformListing;
    indexVendor(vendor: any): Promise<void>;
    deleteVendor(id: string): Promise<void>;
    bulkSyncVendors(): Promise<void>;
    private transformVendor;
    indexEvent(event: any): Promise<void>;
    deleteEvent(id: string): Promise<void>;
    private transformEvent;
}
