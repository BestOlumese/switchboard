// Light smoke test for preview deployments (Neon branch — keep it gentle).

import { check, sleep } from 'k6';
import http from 'k6/http';

const WEB = __ENV.BASE_URL;
const API = __ENV.API_URL;
const headers = __ENV.BYPASS ? { 'x-vercel-protection-bypass': __ENV.BYPASS } : {};

export const options = {
  vus: 5,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const pages = ['/', '/b/fade-republic', '/b/fade-republic/chat'];
  for (const p of pages) {
    check(http.get(WEB + p, { headers }), { [`${p} 200`]: (r) => r.status === 200 });
  }
  check(http.get(`${API}/health`, { headers }), { 'api health': (r) => r.status === 200 });
  check(http.get(`${API}/public/fade-republic/slots?service=low-cut&limit=6`, { headers }), {
    'slots 200': (r) => r.status === 200,
  });
  sleep(1);
}
