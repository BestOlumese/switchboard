# F04 — AI booking agent (WhatsApp + web chat)

**Phase:** P3 · **Owner:** A (agent), B (web chat UI)

**Story:** As a customer, I message like I'd message the barber ("I wan do low cut tomorrow evening"), and get booked.

Spec: `docs/06-ai-agent.md`, `docs/07-whatsapp.md`.

## Acceptance criteria

- [ ] Same agent pipeline for both channels; channel only changes the send adapter
- [ ] Understands English, pidgin, and common booking slang (eval set ≥ 85%)
- [ ] Offers ≤ 3 times per message, spread across the requested part of day
- [ ] States deposit amount and hold time before holding
- [ ] Deposit details and confirmations are template-rendered from DB values
- [ ] Redelivered WhatsApp messages don't trigger a second reply
- [ ] Customer saying "human", "person", "customer care", or a complaint → handoff
- [ ] Reply latency p95 < 6s including LLM (measured, shown on dashboard)
- [ ] Remembers returning customers by phone ("Welcome back, Tobi — same low cut with Dayo?")
