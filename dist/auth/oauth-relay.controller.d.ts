import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
export declare class OAuthRelayController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    start(redirect: string, intent: string, req: Request, res: Response): Promise<void>;
    relay(redirect: string, intent: string, req: Request, res: Response): Promise<void>;
    private typeNewVendor;
}
