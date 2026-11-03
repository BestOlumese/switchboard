// Fires 2,000 signed Kora-style webhooks via mock-kora: 30% duplicates, shuffled.
// Pass = webhook endpoint stays fast, and the API reports processed unique events == unique events sent.

import { check, sleep } from 'k6';
import http from 'k6/http';

const API = __ENV.API_URL || 'http://localhost:4000';
const MOCK = __ENV.MOCK_KORA_URL || 'http://localhost:4010';
const TOKEN = __ENV.CHAOS_TOKEN || 'local-chaos';

export const options = {
  scenarios: {
    storm: {
      executor: 'constant-arrival-rate',
      rate: 200,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 50,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.001'],
    'http_req_duration{name:storm}': ['p(95)<200'],
  },
};

export function setup() {
  http.post(`${MOCK}/_control/reset`);
  http.post(`${MOCK}/_control/mode`, JSON.stringify({ duplicate: 1.3, shuffle: true }), {
    headers: { 'content-type': 'application/json' },
  });
}

export default function () {
  // mock-kora creates a charge, then emits its signed webhook(s) to the API per current chaos mode
  const res = http.post(`${MOCK}/_control/storm-one`, null, { tags: { name: 'storm' } });
  check(res, { accepted: (r) => r.status === 202 });
}

export function teardown() {
  sleep(15); // let Inngest drain
  const sent = http.get(`${MOCK}/_control/log/summary`).json();
  const state = http
    .get(`${API}/internal/chaos/state`, { headers: { 'x-chaos-token': TOKEN } })
    .json();
  if (state.uniquePaymentEvents !== sent.uniqueEvents) {
    throw new Error(`dedupe broken: api=${state.uniquePaymentEvents} sent=${sent.uniqueEvents}`);
  }
}
