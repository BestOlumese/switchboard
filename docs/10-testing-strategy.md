# 10 — Testing strategy

| Layer | Tool | Runs | What it proves |
|-------|------|------|----------------|
| Unit | Vitest | every push | Pure logic: slot generation, state transitions, kobo conversion, signature verify |
| Property | fast-check | every push | Booking invariants hold for random operation sequences |
| Integration | Vitest + Docker Postgres + mock-kora | every push | Constraints, transactions, webhook → confirm flow, idempotency |
| Agent scenarios | Vitest + `ai/test` mock model | every push | Tools called correctly; guardrails strip fake confirmations |
| Agent evals | real LLM | nightly | Understanding of real Nigerian booking messages (pass rate tracked) |
| E2E | Playwright + axe | every PR | Owner onboarding, booking page flow, staff inbox takeover, a11y |
| Lighthouse | LHCI | every PR (preview) + prod | Perf/a11y/BP/SEO budgets |
| Load | k6 | PR smoke + nightly full | Latency + error budgets under load |
| Chaos | k6 + mock-kora chaos mode | nightly + on stage | Zero double-bookings, zero double-counted payments under hostile conditions |

## Coverage gates

`packages/booking` and `packages/kora`: **≥ 90% lines/branches** (enforced). Others: ≥ 70%.

## Integration test setup

- Each test file gets its own Postgres **schema** (fast isolation) via a Vitest global setup; migrations run once per schema.
- mock-kora runs as a container (CI `services:`); tests reset it via `POST /_control/reset`.

## Load tests (`load/k6/`)

| Script | Scenario | Thresholds |
|--------|----------|-----------|
| `booking-contention.js` | 100 VUs hold the same 10 slots at once | exactly 10 holds succeed; `http_req_failed` (5xx) < 0.1%; p95 < 400ms |
| `webhook-storm.js` | 2,000 Kora webhooks, 30% duplicates, shuffled | `payment_events` unique rows = unique events; p95 < 200ms |
| `chat-throughput.js` | 50 concurrent web-chat conversations (mock LLM) | p95 reply < 1.5s excluding LLM time |
| `smoke.js` | 5 VUs, 1 min, public pages + slot API | p95 < 500ms, 0 errors (runs on preview) |

**Never against prod Neon.** Full runs use the Docker stack in CI. Preview gets only `smoke.js` (Neon free-tier compute is small).

## Chaos suite (`pnpm chaos`) — the stage demo

1. Seed: 1 business, 2 staff, 10 open slots tomorrow.
2. mock-kora mode: `duplicate: 3, shuffle: true, delayMs: 0-8000, dropRate: 0.05, queryTimeoutRate: 0.2`.
3. 100 bots: find slots → hold → request deposit → 70% pay, 20% never pay, 10% pay late (after expiry).
4. Run sweeper + reconciliation until quiet.
5. **Assert** (and show live on the dashboard):
   - active bookings per staff have zero overlaps (SQL check)
   - `confirmed` count = number of verified successful payments for live holds
   - every late payment for a lost slot has a refund
   - no `held` booking with `hold_expires_at < now()`
   - `payment_events` duplicates rejected = duplicates sent (from mock-kora log)

Exit code non-zero on any violation → nightly CI fails.
