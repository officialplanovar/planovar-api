import type { Request } from 'express';
import { CallsService } from './calls.service';
import { CallTokenDto } from './dto/call-token.dto';
export declare class CallsController {
    private readonly callsService;
    constructor(callsService: CallsService);
    token(req: Request, dto: CallTokenDto): Promise<{
        url: string;
        token: string;
        roomName: string;
    }>;
}
