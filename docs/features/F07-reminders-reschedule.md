# F07 — Reminders and reschedule

**Phase:** P4 · **Owner:** A

**Story:** As a customer, I get reminded and can move my booking by replying, instead of just not showing up.

## Acceptance criteria

- [ ] On `booking.confirmed`: schedule reminders at −24h and −2h (skip any already in the past)
- [ ] Outside the 24h window → approved WhatsApp template; inside → free-form
- [ ] Cancelled/rescheduled booking cancels its pending reminders (Inngest `cancelOn` event)
- [ ] Reply "2" or "reschedule" → agent offers new times; new slot is held; old booking moves only when new is confirmed (deposit carries over, no second payment)
- [ ] Reschedule allowed only before the free-cancel window closes; otherwise handoff
