# F02 — Public booking page

**Phase:** P1–P2 · **Owner:** B (UI), A (API)

**Story:** As a customer who found the salon on Instagram, I book and pay a deposit without chatting.

## Flow

Service → (optional) staff → day strip → time chip → name + phone → **Hold this time** → deposit card with hold band → transfer → Confirmed.

## Acceptance criteria

- [ ] Works without JavaScript up to slot selection (server-rendered); JS enhances
- [ ] Idempotency key generated on mount; double tap on "Hold this time" creates one booking
- [ ] `SLOT_TAKEN` → inline message "That time just got taken. Here are the next three." + refreshed chips
- [ ] Deposit card shows `amount_expected` exactly, account number with copy button, bank name, live countdown
- [ ] Status polling every 3s; stops on terminal state
- [ ] Expired → "Your hold ended. Pick a time again." with chips restored
- [ ] Lighthouse mobile ≥ 95 perf, 100 a11y/BP/SEO; JS ≤ 120 KB gzip
- [ ] Open Graph tags (business name, area) for WhatsApp link previews
