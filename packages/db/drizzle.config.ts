import { defineConfig } from 'drizzle-kit';

// `generate` only diffs the TS schema against sql/meta; it never connects.
// Applying migrations goes through src/migrate.ts (validated env, unpooled URL).
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './sql',
  casing: 'snake_case',
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? '' },
});
