# 06 — AI agent

`packages/agent` — Vercel AI SDK `generateText` with tools, `stopWhen: stepCountIs(6)`. Provider chosen by env (`LLM_PROVIDER`, `LLM_MODEL`).

## Principle

The model **talks**; tools **decide**. Prices, deposit amounts, account numbers, availability, and booking status only ever come from tool results. Confirmation messages are rendered from templates filled with DB values — the model cannot free-text "you're booked".

## Tools

| Tool | Args | Writes? | Returns |
|------|------|---------|---------|
| `list_services` | — | no | name, duration, price, deposit rule |
| `find_slots` | service_id, date_from, date_to, staff_id? , part_of_day? | no | ≤ 6 slots across the range |
| `hold_slot` | service_id, staff_id, starts_at | yes (idempotent) | booking_id, hold_expires_at — or `SLOT_TAKEN` |
| `request_deposit` | booking_id | yes (idempotent) | **template id** + filled values (bank, account no., amount, expiry) |
| `get_booking_status` | booking_id? | no | status from DB |
| `cancel_booking` | booking_id, reason | yes | refund eligibility + action taken |
| `reschedule_booking` | booking_id, new_starts_at | yes | new hold (old stays until new confirmed) |
| `remember_customer` | name?, preference? | yes | — |
| `handoff_to_staff` | reason | yes | conversation → `needs_human` |

All tool args are Zod-validated. Server injects `business_id`, `customer_id`, `conversation_id` — the model never supplies them (prevents cross-tenant tool calls).

## System prompt (outline)

- You are the booking assistant for {business.name} in {city}. Be brief, warm, Nigerian-English friendly. Understand pidgin and common slang ("low cut", "abeg", "I wan book").
- Only offer times returned by `find_slots`. Never guess.
- Always state deposit amount and that the slot is held for {HOLD_MINUTES} minutes.
- Never say a booking is confirmed. The system sends confirmations.
- Hand off when: complaint, refund dispute, medical/allergy question, price negotiation, anything outside booking, or the customer asks for a human.
- Business-specific FAQ is appended (address, parking, what to bring).

## Guardrails

1. **Output filter:** reject model text containing "confirmed"/"booked" unless the last tool result shows `confirmed`. Replace with a status template.
2. **Number filter:** any ₦ amount or 10-digit account number in model text must appear in a tool result from this turn; otherwise strip and use template.
3. **Loop guard:** max 6 steps; on exhaustion → `handoff_to_staff('agent_loop')`.
4. **Pause:** if conversation is `needs_human`, the agent does not run.
5. **Cost:** log tokens per conversation; per-business monthly cap on Starter.
6. **Prompt injection:** customer text is user content only; tool results never contain instructions.

## Testing

- Unit: tools against Docker Postgres.
- Agent scenarios with `ai/test` mock model scripted tool calls (book happy path, slot taken mid-conversation, underpayment, cancel within window, "I want to talk to a person").
- Eval set (`packages/agent/evals/*.json`): 40 real-style Nigerian booking messages → expected first tool + args. Run nightly against the real model; track pass rate on the chaos dashboard.
