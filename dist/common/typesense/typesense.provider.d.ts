import { ConfigService } from '@nestjs/config';
import { Client } from 'typesense';
export declare const TYPESENSE_CLIENT = "TYPESENSE_CLIENT";
export declare const TypesenseProvider: {
    provide: string;
    inject: (typeof ConfigService)[];
    useFactory: (config: ConfigService) => Client;
};
