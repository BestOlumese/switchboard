// Vercel entry: Hono apps are served from a default export.
import { attachDatabasePool } from '@vercel/functions';
import { boot } from './runtime.ts';

const { app, pool } = boot();
// Close idle clients before Vercel suspends the instance (docs/concerns/serverless-db-connections.md).
attachDatabasePool(pool);

export default app;
