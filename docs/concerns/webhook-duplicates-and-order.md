# Concern — Duplicate, out-of-order, missing webhooks

**Risk:** Kora and Meta both deliver at-least-once. Events can repeat, arrive out of order, or never arrive.

**Handling:**

- Dedupe at insert: `UNIQUE (provider, provider_event_key)`; messages by `provider_message_id`.
- Process from **current truth**, not event order: the worker re-queries Kora and applies the state it returns; transitions are guarded (`WHERE status = expected`), so a stale `charge.failed` after `succeeded` does nothing.
- Missing webhook: reconciliation cron queries every `pending` payment older than 2 min.
- Webhook handler does no business logic — verify, insert, enqueue, 200. Slow handlers cause provider retries.

**Test:** webhook storm k6 script; chaos mode `duplicate: 3, shuffle: true, dropRate: 0.05`.
