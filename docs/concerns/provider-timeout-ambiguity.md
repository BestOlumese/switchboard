# Concern — Provider timeout ambiguity

**Risk:** we call Kora to create a charge or refund, and the request times out. Did it happen?

**Handling:**

- Every outbound Kora write uses **our** unique `reference`, created and stored *before* the call. A retry with the same reference either returns the existing object or fails as duplicate — both tell us it exists.
- Timeout → status `pending_verification`; Inngest retries **the query** (`GET /charges/:reference`), not the write, until known.
- Agent tells the customer "Getting your payment details…" and the system follows up when known — never invents account details.
- Same for WhatsApp sends: store outbound message with a client id; resend only if Meta returns no message id.

Invariant I7: timeout ≠ failure.
