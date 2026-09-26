import { AdminService } from './admin.service';
export declare class AdminSettingsController {
    private readonly admin;
    constructor(admin: AdminService);
    get(): Promise<{
        id: string;
        updatedAt: Date;
        currency: string;
        platformName: string;
        supportEmail: string;
        region: string;
        maintenanceMode: boolean;
    }>;
    update(body: {
        platformName?: string;
        supportEmail?: string;
        currency?: string;
        region?: string;
        maintenanceMode?: boolean;
    }): Promise<{
        id: string;
        updatedAt: Date;
        currency: string;
        platformName: string;
        supportEmail: string;
        region: string;
        maintenanceMode: boolean;
    }>;
}
