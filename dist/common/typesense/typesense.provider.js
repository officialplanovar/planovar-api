"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypesenseProvider = exports.TYPESENSE_CLIENT = void 0;
const config_1 = require("@nestjs/config");
const typesense_1 = require("typesense");
exports.TYPESENSE_CLIENT = 'TYPESENSE_CLIENT';
exports.TypesenseProvider = {
    provide: exports.TYPESENSE_CLIENT,
    inject: [config_1.ConfigService],
    useFactory: (config) => {
        return new typesense_1.Client({
            nodes: [
                {
                    host: config.get('TYPESENSE_HOST', 'localhost'),
                    port: config.get('TYPESENSE_PORT', 8108),
                    protocol: config.get('TYPESENSE_PROTOCOL', 'http'),
                },
            ],
            apiKey: config.get('TYPESENSE_API_KEY', 'xyz'),
            connectionTimeoutSeconds: 5,
        });
    },
};
//# sourceMappingURL=typesense.provider.js.map