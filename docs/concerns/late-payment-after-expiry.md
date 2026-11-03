# Concern — Late payment after hold expiry

**Risk:** customer transfers at minute 16; hold expired at 15; slot may already belong to someone else. Kora still sends `charge.success`.

**Handling (in `kora/event.received`, after re-verify):**

1. Booking still `held` → confirm normally.
2. Booking `expired`, slot **still free** → try `holdSlot` for the same time with key `late:<payment_id>`; success → confirm. Tell customer "Payment received — you're confirmed."
3. Booking `expired`, slot **taken** → refund automatically, then agent offers the next 3 times ("Your payment came after the hold ended and that time was taken. We've refunded ₦1,015. Want one of these instead?").
4. Never leave money unattached: a daily check alerts on any `succeeded` deposit not linked to a `confirmed`/`completed`/`no_show` booking or a refund.

**Mitigation:** Kora dynamic account expiry set equal to hold expiry so most late transfers bounce at the bank level.

**Test:** integration test for all three branches; chaos suite's 10% late payers.
