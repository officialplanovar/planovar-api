import { AdminService } from './admin.service';
export declare class AdminTeamController {
    private readonly admin;
    constructor(admin: AdminService);
    list(): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    promote(body: {
        email: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    setRole(id: string, body: {
        role: string;
    }): Promise<{
        id: string;
        role: string;
    }>;
}
