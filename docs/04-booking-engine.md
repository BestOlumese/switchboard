# 04 — Booking engine (the correctness core)

`packages/booking` — pure domain code. This is what the chaos dashboard proves on stage.

## Guarantees

1. **No double-booking**, even with 100 concurrent requests for one slot. (Postgres exclusion constraint.)
2. **Retries are harmless.** Same `idempotency_key` → same booking back, no second row.
3. **Holds always end.** Every hold either becomes `confirmed` or `expired`. No zombie holds.
4. **Confirmation is earned.** Only a verified payment (or a no-deposit service) confirms.

## Availability: `findSlots(businessId, serviceId, range, staffId?)`

Read-only. Steps:

1. Load working hours for eligible staff (`staff_services`), convert local → UTC per day (Lagos has no DST, still use tz lib).
2. Subtract `time_off` and bookings with status `held` (not yet expired) or `confirmed`.
3. Slice free windows into candidates at 15-minute steps, each `duration_min` long.
4. Drop candidates starting less than `MIN_LEAD_MINUTES` (default 30) from now.
5. Return up to N, spread across the day (not 10 slots all at 9:00).

This is only a **suggestion**. The truth is decided at hold time by the constraint.

## Hold: `holdSlot({ businessId, staffId, serviceId, customerId, startsAt, idempotencyKey })`

```ts
return db.transaction(async (tx) => {
  // 1. Idempotent replay
  const existing = await tx.query.bookings.findFirst({ where: and(eq(b.businessId, businessId), eq(b.idempotencyKey, idempotencyKey)) });
  if (existing) return ok(existing);

  // 2. Reclaim expired holds that overlap (expiry job may lag)
  await tx.execute(sql`
    UPDATE bookings SET status = 'expired', updated_at = now()
    WHERE staff_id = ${staffId} AND status = 'held' AND hold_expires_at <= now()
      AND tstzrange(starts_at, ends_at, '[)') && tstzrange(${startsAt}, ${endsAt}, '[)')`);

  // 3. Insert; the EXCLUDE constraint is the referee
  try {
    const [row] = await tx.insert(bookings).values({ ...,
      status: service.depositType === 'none' ? 'confirmed' : 'held',
      holdExpiresAt: addMinutes(now, HOLD_MINUTES) }).returning();
    await tx.insert(outbox).values({ topic: 'booking.held', payload: { bookingId: row.id } });
    return ok(row);
  } catch (e) {
    if (isExclusionViolation(e)) return err({ code: 'SLOT_TAKEN' });   // SQLSTATE 23P01
    if (isUniqueViolation(e, 'bookings_idem')) return ok(await reread()); // 23505 race on same key
    throw e;
  }
});
```

On `SLOT_TAKEN` the agent immediately calls `findSlots` again and offers the next options. The customer never sees an error.

## Idempotency keys

| Caller | Key |
|--------|-----|
| Agent tool call | `sha256(conversation_id + tool_name + canonical_json(args))` — same model retry → same key |
| Booking page | `crypto.randomUUID()` generated when the form mounts, resent on retry |
| Staff dashboard | Same as booking page |

## Confirm: `confirmFromPayment(paymentId)`

Called only by the `payment.received` Inngest function **after** Kora re-verification:

```sql
-- inside one transaction
UPDATE payments SET status='succeeded', verified_at=now() WHERE id=$1 AND status IN ('pending','pending_verification');
UPDATE bookings SET status='confirmed', hold_expires_at=NULL, version=version+1
  WHERE id=$2 AND status='held';
-- rowCount 0 on bookings → hold already expired → late-payment path
INSERT INTO outbox (topic, payload) VALUES ('booking.confirmed', ...);
```

## Expire: Inngest `hold.expire`

Scheduled with `step.sleepUntil(hold_expires_at)`. Then `UPDATE … SET status='expired' WHERE id=$1 AND status='held' AND hold_expires_at <= now()`. A sweeper cron (every 5 min) catches anything missed.

## Configuration

| Env / setting | Default |
|---------------|---------|
| `HOLD_MINUTES` | 15 (Kora dynamic accounts should be set to expire at the same time) |
| `MIN_LEAD_MINUTES` | 30 |
| `SLOT_STEP_MINUTES` | 15 |

## Tests that must exist

- Property test (fast-check): random sequence of hold/confirm/expire/cancel across N staff → never two overlapping active bookings, every hold ends terminal after sweeper.
- Integration: 100 parallel `holdSlot` for the same slot against real Postgres → exactly 1 ok, 99 `SLOT_TAKEN`.
- Integration: same idempotency key 20× in parallel → 1 row.
- Integration: expired hold that the job hasn't processed yet does not block a new hold.
