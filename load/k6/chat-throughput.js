// 50 concurrent web-chat conversations against the agent pipeline (LLM_PROVIDER=mock).

import { check, sleep } from 'k6';
import http from 'k6/http';

const API = __ENV.API_URL || 'http://localhost:4000';
const SLUG = __ENV.SLUG || 'fade-republic';
const lines = [
  'I wan book low cut tomorrow evening',
  'abeg any time saturday morning?',
  'how much for braids',
  'the first one',
];

export const options = {
  vus: 50,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:chat}': ['p(95)<1500'],
  },
};

export default function () {
  const session = `k6-${__VU}-${__ITER}`;
  for (const text of lines) {
    const res = http.post(`${API}/public/${SLUG}/chat`, JSON.stringify({ session, text }), {
      headers: { 'content-type': 'application/json' },
      tags: { name: 'chat' },
    });
    check(res, { replied: (r) => r.status === 200 && !!r.json('reply') });
    sleep(1);
  }
}
