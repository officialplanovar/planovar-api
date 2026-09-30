import { AdminService } from './admin.service';
export declare class AdminTeamController {
    private readonly admin;
    constructor(admin: AdminService);
    list(): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }[]>;
    promote(body: {
        email: string;
    }): Promise<{
        email: string;
        id: string;
        createdAt: Date;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
    }[]>;
    setRole(id: string, body: {
        role: string;
    }): Promise<{
        id: string;
        role: string;
    }>;
}
