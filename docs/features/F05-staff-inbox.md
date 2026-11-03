# F05 — Staff inbox and takeover

**Phase:** P3–P4 · **Owner:** B (UI), A (API)

**Story:** As an owner, when the assistant isn't sure, I see the chat right away and reply myself.

## Acceptance criteria

- [ ] Conversations with `needs_human` pinned at the top with the reason ("Asked for a person", "Underpaid ₦500")
- [ ] "Reply as staff" sends through the original channel (WhatsApp within the 24h window; warns if window closed)
- [ ] While a human has it, the agent is paused for that conversation
- [ ] "Hand back to assistant" resumes the agent, which reads the staff messages as context
- [ ] Staff can perform booking actions from the chat sidebar (hold a time, request deposit, cancel)
- [ ] New needs-human conversation shows within 5s (polling)
