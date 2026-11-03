# P5 — Money ops + chaos (Nov 15–17)

**Goal:** the full money loop and the stage-ready chaos proof.

## Tasks

- [ ] A: Refunds (cancel within window, business cancel, late payment, overpayment surplus) with Kora refund API + status tracking
- [ ] A: Payouts: daily Inngest settlement of completed deposits minus fee → Kora disburse; `transfer.*` webhooks
- [ ] A: Subscription billing: Kora Checkout redirect for Pro, webhook activation, renewal link job, Starter limits
- [ ] A: Chaos runner (`pnpm chaos`) + `GET /internal/chaos/state` (auth: chaos token) streaming counters
- [ ] A: k6 scripts: contention, webhook storm, chat throughput, smoke; `load.yml` workflow
- [ ] B: Money dashboard: deposits collected, no-shows covered (₦), refunds, payouts, after-hours inquiries handled
- [ ] B: Billing page: plan, upgrade button, history
- [ ] B: Chaos dashboard (`/chaos`, projector dark mode): 10 slot tiles, bot log, 5 invariant counters, Run button

## Exit criteria

- `pnpm chaos` passes 10 runs in a row
- Nightly `load.yml` green with thresholds from `10-testing-strategy.md`
- Business can upgrade to Pro with a sandbox Checkout payment

**Post:** chaos test video — "100 bots, 10 slots, 0 double-bookings".
