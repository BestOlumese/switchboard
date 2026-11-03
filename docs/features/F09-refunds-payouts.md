# F09 — Refunds and payouts

**Phase:** P5 · **Owner:** A (API), B (UI)

Spec: `docs/05-kora-integration.md` §4–5.

## Refund acceptance criteria

- [ ] Triggers: business cancel · customer cancel in free window · late payment for taken slot · overpayment surplus
- [ ] One refund per (original payment, reason) — idempotency key
- [ ] Customer gets "Deposit refunded" message; owner sees refund in booking timeline
- [ ] Refund failure → `refund_failed`, owner alert, manual retry button

## Payout acceptance criteria

- [ ] Owner adds bank account (Kora bank account resolve to show account name before saving)
- [ ] Daily settlement: deposits of `completed`/`no_show` bookings minus Switchboard fee
- [ ] One payout per business per day (idempotency key `payout:<business>:<date>`)
- [ ] `transfer.failed` → retry once next day, then owner alert
- [ ] Payout history page with each included booking
