import { defineConfig } from 'tsdown';

// Workspace packages ship TS source, so they're bundled in. Their own npm deps (pg, drizzle-orm, zod)
// get bundled too: pnpm's strict layout means apps/api couldn't resolve them at runtime otherwise.
export default defineConfig({
  entry: ['src/server.ts'],
  format: 'esm',
  platform: 'node',
  target: 'node22',
  deps: { alwaysBundle: [/^@switchboard\//], onlyBundle: false },
  dts: false,
});
