# 05 — Kora integration

`packages/kora` wraps every Kora call. Four products, one rule: **webhooks tell us something happened; the transaction query tells us what's true.**

> Paths marked ⚠️ are from Kora's FAQ/docs as of Nov 2026 — confirm against `developers.korapay.com` while building `packages/kora`. Bank-transfer-via-API must be **enabled on the account by Kora support** — email them on day 1.

## Base & auth

- Base URL: `https://api.korapay.com/merchant` (same host for test and live; the key decides the mode)
- Server calls: `Authorization: Bearer ${KORA_SECRET_KEY}` (`sk_test_…` / `sk_live_…`)
- Client (Checkout Standard only): `KORA_PUBLIC_KEY` (`pk_…`)
- Locally: `KORA_BASE_URL=http://mock-kora:4010/merchant`

## Amounts

Kora takes **naira (major units)** with decimals. We store kobo. Convert only here:

```ts
export const toKoraAmount = (k: Kobo) => Number(k) / 100;           // 150000n → 1500
export const fromKoraAmount = (n: number) => BigInt(Math.round(n * 100)) as Kobo;
```

## 1. Booking deposits — Pay with Bank Transfer

`POST /api/v1/charges/bank-transfer` ⚠️

```json
{
  "reference": "sb_dep_01JC…",          // our payments.kora_reference, ≥ 8 chars, unique
  "amount": 1000,
  "currency": "NGN",
  "account_name": "Fade Republic via Switchboard",
  "customer": { "name": "Tobi A.", "email": "c_<customer_id>@pay.switchboard.ng" },
  "merchant_bears_cost": false,
  "notification_url": "https://api.<domain>/webhooks/kora",
  "metadata": { "booking_id": "…", "business_id": "…" }
}
```

Response → store `bank_account.account_number`, `bank_name`, `expiry_date_in_utc`, `fee`, `amount_expected`. The agent sends these to the customer exactly as returned.

- Customers often have no email → we generate a deterministic placeholder per customer. Never invent a real-looking one.
- Fee: decide per business whether customer (`merchant_bears_cost: false`) or business bears it. Show the **total to transfer** (`amount_expected`) — not the base amount.
- Sandbox: request with `auto_complete: true` for quick demos, or `false` + call the Sandbox Virtual Bank Account Credit API to pay manually (used in the live stage demo so the payment is visible).

## 2. Webhooks — `POST /webhooks/kora`

Verification (from Kora docs): `x-korapay-signature` = HMAC-SHA256 of **only the `data` object**, using the secret key.

```ts
const expected = createHmac('sha256', env.KORA_SECRET_KEY).update(JSON.stringify(body.data)).digest('hex');
if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig ?? ''))) return c.json({ ok: true }, 200); // ignore silently
```

⚠️ Signature is over `JSON.stringify(data)` — read the raw body, parse once, re-stringify `data` without reordering keys. Add a test using a captured real sandbox payload.

Handler steps (must finish in < 1s):

1. Verify signature.
2. `INSERT INTO payment_events (provider, provider_event_key, …)` where key = `event.id` if present, else `${event}:${data.reference}:${data.status}`. On conflict → `200`, stop.
3. `inngest.send({ name: 'kora/event.received', data: { eventId } })`.
4. Return `200`.

Events we handle: `charge.success`, `charge.failed`, `transfer.success`, `transfer.failed` (payouts), plus refund events ⚠️ (confirm names; fall back to polling refund status).

## 3. Re-verification (invariant I2)

Inngest `kora/event.received`:

1. `GET /api/v1/charges/:reference` ⚠️
2. Check: status `success`, currency NGN, reference matches a `payments` row, **amount paid ≥ amount expected**.
3. **Underpayment** (Kora still sends `charge.success` with the amount actually paid) → payment `underpaid`, conversation → `needs_human`, slot stays held until expiry. Agent tells customer the shortfall.
4. **Overpayment** → confirm, record surplus, queue refund of the surplus.
5. Query fails / times out → payment `pending_verification`, retry with backoff (Inngest), reconciliation cron every 10 min.

## 4. Refunds

`POST /api/v1/refunds/initiate` ⚠️ with `{ reference: <new unique>, payment_reference: <original>, amount? }` (omit amount → full refund).

Triggered by: business cancels · customer cancels inside free-cancel window · late payment for a slot that's gone · overpayment surplus. Refund row is its own `payments` record (`kind='refund'`) with its own idempotency key = `refund:${original_payment_id}:${reason}`.

## 5. Payouts to business

`POST /api/v1/transactions/disburse` ⚠️ (bank account destination). Inngest cron settles **confirmed + completed** deposits minus Switchboard fee daily. Events: `transfer.success` / `transfer.failed`.

**Pitch note:** holding funds on behalf of businesses needs a licensed model in production (e.g., Kora sub-merchant / split settlement or the business connecting its own Kora account). Demo runs in sandbox only. Have this answer ready for judges.

## 6. Subscription billing — Kora Checkout

`POST /api/v1/charges/initialize` → `checkout_url` (redirect checkout). Business clicks "Upgrade to Pro" → Kora hosted page → `charge.success` webhook with `metadata.kind = 'subscription'` → `subscriptions.status = 'active'`, `current_period_end = +30 days`. Renewal: Inngest sends a payment link 3 days before period end (no card tokenisation in MVP).

## mock-kora (local + CI)

`apps/mock-kora` implements the endpoints above with the same request/response shapes and signs webhooks with `KORA_SECRET_KEY` exactly as Kora does. Control API:

| Endpoint | Effect |
|----------|--------|
| `POST /_control/pay { account_number, amount }` | Simulate customer transfer → fires `charge.success` |
| `POST /_control/mode { duplicate: 3, delayMs: 5000, shuffle: true, dropRate: 0.1, queryTimeoutRate: 0.2 }` | Chaos: duplicate, delay, reorder, drop webhooks; make the query API time out |
| `GET /_control/log` | Every webhook sent (used by chaos assertions) |
