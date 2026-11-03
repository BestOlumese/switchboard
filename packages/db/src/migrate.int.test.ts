import { migrateSchema, parseEnv } from '@switchboard/env';
import { afterAll, describe, expect, it } from 'vitest';
import { createPool } from './client.ts';

// Runs after `pnpm db:migrate` (CI integration job, or `docker compose exec api pnpm test:int`).
const pool = createPool(parseEnv(migrateSchema).DATABASE_URL_UNPOOLED, { max: 1 });
afterAll(() => pool.end());

describe('migrations', () => {
  it('installs btree_gist (needed by the I1 overlap constraint)', async () => {
    const { rowCount } = await pool.query(
      `SELECT 1 FROM pg_extension WHERE extname = 'btree_gist'`,
    );
    expect(rowCount).toBe(1);
  });

  it('creates businesses with a unique slug', async () => {
    const { rows } = await pool.query<{ indexdef: string }>(
      `SELECT indexdef FROM pg_indexes WHERE tablename = 'businesses' AND indexdef ILIKE '%UNIQUE%(slug)%'`,
    );
    expect(rows).toHaveLength(1);
  });
});
