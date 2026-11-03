// Node entry: local Docker (`tsx watch`) and the production-like compose build.
import { serve } from '@hono/node-server';
import { boot } from './runtime.ts';

const { app, env, logger, pool } = boot();

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info({ port: info.port }, 'api listening');
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close();
    void pool.end().finally(() => process.exit(0));
  });
}
