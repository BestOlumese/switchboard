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
  // Only routes that exist. Add '/b/fade-republic' (P2) and '/b/fade-republic/chat' (P3) as they land.
  const pages = ['/'];
  for (const p of pages) {
    check(http.get(WEB + p, { headers }), { [`${p} 200`]: (r) => r.status === 200 });
  }
  check(http.get(`${API}/health`, { headers }), { 'api health': (r) => r.status === 200 });
  // TODO(P1/P2): re-enable once the public slots endpoint exists:
  // GET ${API}/public/fade-republic/slots?service=low-cut&limit=6 → 200
  sleep(1);
}
