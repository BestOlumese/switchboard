# P4 — Business dashboard (Nov 12–15)

**Goal:** everything an owner needs between clients.

## Tasks

- [ ] B: Day view: staff columns, booking tiles with hold bands, drag-free (tap to open booking sheet)
- [ ] B: Booking sheet: customer, service, payment timeline, actions (Mark completed, Mark no-show, Cancel and refund, Reschedule)
- [ ] B: Staff inbox: needs-human pinned, live updates (poll 3s), "Reply as staff", "Hand back to assistant"
- [ ] B: Customers (CRM): list, search by phone/name, visit count, no-shows, tags, notes
- [ ] B: Multi-staff: staff management, services per staff, working hours, time off
- [ ] B: Public booking page: "Choose a barber" (optional) step
- [ ] A: Endpoints for all of the above, role checks (owner vs staff) via Better Auth organization roles
- [ ] A: Reminders: Inngest schedules 24h + 2h template messages on `booking.confirmed`; reply "2" → reschedule flow
- [ ] A: No-show marking increments `customers.no_shows`; deposit kept per policy
- [ ] A: Vertical templates (auto service, property viewing, clinic) as seed presets in onboarding

## Exit criteria

- Owner can take over a live WhatsApp conversation and hand it back
- Reminder template arrives (or is shown in stub log locally)
- Playwright: owner onboarding → share link → customer books → owner sees it; axe clean

**Post:** dashboard walkthrough clip.
