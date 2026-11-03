# F03 — Booking deposits (Kora)

**Phase:** P2 · **Owner:** A

**Story:** As an owner, I only block a slot for customers who've paid a deposit, so no-shows stop costing me.

Spec: `docs/05-kora-integration.md` §1–3. Rules: `docs/04-booking-engine.md`.

## Deposit calculation

| `deposit_type` | Amount |
|----------------|--------|
| `none` | no deposit; hold → confirmed immediately |
| `fixed` | `deposit_value` kobo |
| `percent` | `round(price_kobo × deposit_value / 100)` to nearest ₦50 |
| `full` | `price_kobo` |

## Acceptance criteria

- [ ] One `payments` row and one Kora charge per booking, even if `request_deposit` is called 5×
- [ ] Kora dynamic account expiry ≤ hold expiry
- [ ] Confirmation only after re-verify (unit test: webhook alone does not confirm)
- [ ] Underpaid → `underpaid`, conversation → needs human, customer told shortfall
- [ ] Overpaid → confirmed + surplus refund queued
- [ ] Late payment handled per `concerns/late-payment-after-expiry.md`
- [ ] Every state change in `audit_log`
