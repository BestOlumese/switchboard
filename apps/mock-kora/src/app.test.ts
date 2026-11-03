import { describe, expect, it } from 'vitest';
import { createApp } from './app.ts';
import { createState } from './state.ts';

describe('mock-kora control plane', () => {
  it('reports healthy', async () => {
    const res = await createApp().request('/health');
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('reset wipes charges, logs and chaos settings', async () => {
    const state = createState();
    state.charges.set('sb_dep_x', {});
    state.webhookLog.push({});
    state.chaos.duplicate = 3;
    const app = createApp(state);

    const res = await app.request('/_control/reset', { method: 'POST' });
    expect(res.status).toBe(200);

    const after = await (await app.request('/_control/state')).json();
    expect(after).toMatchObject({
      charges: 0,
      webhooksSent: 0,
      waMessages: 0,
      chaos: { duplicate: 1 },
    });
  });
});
