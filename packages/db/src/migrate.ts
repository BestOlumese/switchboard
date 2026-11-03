import { fileURLToPath } from 'node:url';
import { migrateSchema, parseEnv } from '@switchboard/env';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDb, createPool } from './client.ts';

// Forward-only. Uses the *unpooled* URL: PgBouncer transaction mode breaks some DDL.
const env = parseEnv(migrateSchema);
const pool = createPool(env.DATABASE_URL_UNPOOLED, { max: 1 });
const migrationsFolder = fileURLToPath(new URL('../sql', import.meta.url));

try {
  await migrate(createDb(pool), { migrationsFolder });
  console.log('migrations applied');
} finally {
  await pool.end();
}
