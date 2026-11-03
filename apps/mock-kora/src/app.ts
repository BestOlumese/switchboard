import { Hono } from 'hono';
import { createState, type MockState } from './state.ts';

export function createApp(state: MockState = createState()) {
  const app = new Hono();

  app.get('/health', (c) => c.json({ status: 'ok' }));

  // ── control plane (tests, chaos suite, chaos dashboard) ──
  app.post('/_control/reset', (c) => {
    Object.assign(state, createState());
    return c.json({ reset: true });
  });

  app.get('/_control/state', (c) =>
    c.json({
      charges: state.charges.size,
      webhooksSent: state.webhookLog.length,
      waMessages: state.waOutbox.length,
      chaos: state.chaos,
    }),
  );

  app.get('/', (c) =>
    c.html(
      '<!doctype html><title>mock-kora</title><h1>mock-kora</h1>' +
        '<p>Fake Kora + WhatsApp stub for local and CI. Charges, webhooks and chaos controls land in P2.</p>' +
        '<p><a href="/_control/state">/_control/state</a></p>',
    ),
  );

  return app;
}
