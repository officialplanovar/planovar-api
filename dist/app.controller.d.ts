import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
export declare class AppController {
    private readonly appService;
    private readonly prisma;
    constructor(appService: AppService, prisma: PrismaService);
    getHello(): string;
    health(): {
        status: string;
        uptime: number;
        timestamp: string;
    };
    ready(): Promise<{
        status: string;
        db: string;
        timestamp: string;
    }>;
}
