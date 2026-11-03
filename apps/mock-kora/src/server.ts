import { serve } from '@hono/node-server';
import { mockKoraSchema, parseEnv } from '@switchboard/env';
import { createApp } from './app.ts';

const env = parseEnv(mockKoraSchema);

serve({ fetch: createApp().fetch, port: env.PORT }, (info) => {
  console.log(`mock-kora listening on :${info.port} → webhooks to ${env.WEBHOOK_TARGET}`);
});
