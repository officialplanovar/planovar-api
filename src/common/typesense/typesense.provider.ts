import { ConfigService } from '@nestjs/config';
import { Client } from 'typesense';

export const TYPESENSE_CLIENT = 'TYPESENSE_CLIENT';

export const TypesenseProvider = {
  provide: TYPESENSE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Client => {
    return new Client({
      nodes: [
        {
          host: config.get<string>('TYPESENSE_HOST', 'localhost'),
          port: config.get<number>('TYPESENSE_PORT', 8108),
          protocol: config.get<string>('TYPESENSE_PROTOCOL', 'http'),
        },
      ],
      apiKey: config.get<string>('TYPESENSE_API_KEY', 'xyz'),
      connectionTimeoutSeconds: 5,
    });
  },
};
