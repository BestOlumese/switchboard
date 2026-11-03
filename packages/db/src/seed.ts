import { dbSchema, parseEnv } from '@switchboard/env';
import { createDb, createPool } from './client.ts';
import { businesses } from './schema/index.ts';

// Idempotent: safe to rerun on every preview deploy.
// P0 seeds the business row only; staff, services and history arrive with their tables (P1+).
const env = parseEnv(dbSchema);
const pool = createPool(env.DATABASE_URL, { max: 1 });

try {
  const db = createDb(pool);
  await db
    .insert(businesses)
    .values({ name: 'Fade Republic', slug: 'fade-republic', vertical: 'barber', plan: 'pro' })
    .onConflictDoNothing({ target: businesses.slug });
  console.log('seeded: Fade Republic, Ota');
} finally {
  await pool.end();
}
