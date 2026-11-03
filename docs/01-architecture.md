# 01 — Architecture

## System diagram

```
                ┌───────────────┐        ┌──────────────────┐
 Customer ──────│ WhatsApp      │──────▶ │                  │
  (phone)       │ Meta Cloud API│ webhook│                  │
                └───────────────┘        │   apps/api       │
                                         │   Hono on Vercel │──────▶ LLM provider
 Customer ──────▶ apps/web  ── /api/* ──▶│                  │        (AI SDK)
  (browser)      chat widget  rewrite    │  ┌────────────┐  │
                 booking page            │  │ agent      │  │
                                         │  │  tools ────┼──┼──▶ packages/booking
 Owner/staff ───▶ apps/web dashboard ───▶│  └────────────┘  │          │
                                         │  webhooks/kora   │◀─────────┼──── Kora
                                         │  webhooks/wa     │          │   (charge, refund,
                                         │  /api/inngest    │          │    payout events)
                                         └────────┬─────────┘          │
                                                  │                    ▼
                                         ┌────────▼─────────┐   ┌─────────────┐
                                         │ Inngest          │   │ Neon        │
                                         │ hold expiry      │──▶│ Postgres    │
                                         │ reminders        │   │ (pg Pool)   │
                                         │ reconciliation   │   └─────────────┘
                                         │ outbox relay     │
                                         └──────────────────┘
```

## Same-origin rule

`apps/web` rewrites `/api/:path*` → `API_ORIGIN/:path*` (Next.js `rewrites`). The browser only ever talks to the web origin, so:

- Better Auth cookies are first-party (no cross-site cookie pain)
- No CORS config for the dashboard
- Webhooks (Kora, Meta) hit `apps/api` directly on its own domain

## Request flows

### A. Book with deposit (happy path)

```
customer msg ─▶ api /webhooks/whatsapp (verify X-Hub-Signature-256, 200 fast)
             ─▶ inngest "message.received" (dedupe by wa message id)
             ─▶ agent.run(conversation)
                 tool find_slots(service, date range)        → read-only
                 tool hold_slot(slot, idempotency_key)        → booking HELD, expires_at = now+15m
                 tool request_deposit(booking_id, idem_key)   → Kora bank-transfer charge, payment PENDING
             ─▶ reply with account no. + amount + expiry (template from DB values)
             ─▶ inngest schedule "hold.expire" at expires_at

customer pays ─▶ Kora ─▶ api /webhooks/kora (verify x-korapay-signature)
             ─▶ insert payment_events (UNIQUE event key) — duplicate? return 200, stop
             ─▶ inngest "payment.received"
                 GET Kora transaction query (re-verify amount, status, reference)
                 tx: payment SUCCEEDED, booking CONFIRMED, outbox "booking.confirmed"
             ─▶ outbox relay → WhatsApp confirmation, schedule reminders
```

### B. Hold expires unpaid

`hold.expire` → tx: if booking still `held` and `expires_at <= now()` → `expired`. Payment stays `pending` → if a late payment arrives, see `concerns/late-payment-after-expiry.md`.

### C. Ambiguous / escalation

Agent tool `handoff_to_staff(reason)` → conversation `needs_human`, agent paused for that conversation, staff inbox shows it live. Staff reply goes out via the same channel.

## Boundaries

| Layer | Owns | Must not |
|-------|------|----------|
| `apps/web` | UI, SSR, rewrites | Hold secrets, talk to DB |
| `apps/api` | HTTP, auth, webhook verification, Inngest functions | Contain booking rules |
| `packages/booking` | Availability, holds, state transitions, invariants | Know about HTTP, Kora, LLM |
| `packages/agent` | Conversation, tool schemas, guardrails | Write to DB except via booking tools |
| `packages/kora` | Kora HTTP, signatures, naira↔kobo | Know about bookings |
| Postgres | **Final authority** on overlap and dedupe | — |

## Why Inngest

Every slow or retryable thing runs as an Inngest function: webhook processing, hold expiry, reminders, reconciliation, outbox relay, payouts. Vercel functions stay short; Inngest gives retries, delays, idempotency keys, and a step log we can show on stage.
