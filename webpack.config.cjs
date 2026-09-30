'use strict';

// webpack config for NestJS — handles the CJS/ESM interop needed by better-auth
// while externalising native/complex packages that don't bundle well.

const nodeExternals = require('webpack-node-externals');

module.exports = (options, webpack) => {
  return {
    ...options,

    // Externalise everything in node_modules EXCEPT better-auth (which we need
    // to bundle so webpack can resolve its ESM-only subpath exports).
    externals: [
      nodeExternals({
        allowlist: [
          /^better-auth/,
        ],
      }),
    ],

    module: {
      ...options.module,
      rules: [
        ...(options.module?.rules ?? []),
        // Allow webpack to process .mjs files from better-auth
        {
          test: /\.m?js$/,
          resolve: { fullySpecified: false },
        },
      ],
    },

    resolve: {
      ...options.resolve,
      conditionNames: ['import', 'require', 'node', 'default'],
      extensions: ['.mjs', '.js', '.ts', '.json'],
    },

    plugins: [
      ...(options.plugins ?? []),
      // Suppress optional-require warnings from packages with optional native deps
      new webpack.IgnorePlugin({
        resourceRegExp: /^(bufferutil|utf-8-validate|fsevents|mock-aws-s3|nock|aws-sdk)$/,
      }),
    ],
  };
};
