# F06 — Day calendar and multi-staff

**Phase:** P4 · **Owner:** B (UI), A (API)

**Story:** As an owner, I see who's booked with which barber today and manage each person's hours.

## Acceptance criteria

- [ ] Day view: one column per active staff, 15-min grid, tiles show customer, service, status, hold band
- [ ] Week switcher; today default; Lagos timezone everywhere
- [ ] Staff CRUD, services per staff, weekly hours, time off (blocks availability immediately)
- [ ] Staff role sees only their own column + inbox; owner sees all
- [ ] Walk-in: owner adds a booking from the calendar (source `staff`, no deposit) — goes through `holdSlot` so the overlap constraint still applies
- [ ] Mobile: single staff column with a staff switcher
