import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class TransactionsEnabledGuard implements CanActivate {
    private readonly config;
    constructor(config: ConfigService);
    canActivate(_context: ExecutionContext): boolean;
}
