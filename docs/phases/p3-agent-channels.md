# P3 — Agent + channels (Nov 9–12)

**Goal:** book over WhatsApp and web chat, end to end.

## Tasks

- [ ] A: `packages/agent`: tools from `06-ai-agent.md`, system prompt, guardrails (output + number filters, loop guard)
- [ ] A: Provider switch via env; token logging per conversation
- [ ] A: `packages/whatsapp`: send text, send template, parse webhook, verify signature
- [ ] A: `POST/GET /webhooks/whatsapp`; Inngest `message.received` → agent → send reply; dedupe by message id
- [ ] A: `POST /public/:slug/chat` for web chat (same pipeline, channel `web_chat`)
- [ ] A: `pnpm wa:simulate` script; WA stub in mock-kora
- [ ] A: Agent scenario tests (mock model) + 40-message eval set
- [ ] B: Web chat widget (`/b/[slug]/chat` + embeddable button) — deposit card rendered inline as a rich message
- [ ] B: Conversation view component reused by staff inbox

## Exit criteria

- Real phone → WhatsApp test number → booked + deposit paid (sandbox) → confirmation template received
- Agent never emits "confirmed" text without a confirmed row (guardrail test)
- Eval pass rate ≥ 85% on first tool choice

**Post:** 45-second screen recording of a WhatsApp booking in pidgin.
