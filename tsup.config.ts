import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    banner: '/// <reference path="../types/import-definition.d.ts" />',
  },
});
