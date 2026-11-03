# F01 — Business onboarding

**Phase:** P1 · **Owner:** B (UI), A (API)

**Story:** As a salon owner, I set up my business in under 5 minutes so customers can book me today.

## Flow

1. Sign up (email + password, Better Auth) → creates organization = business, role `owner`.
2. Pick vertical: Salon / barber (default) · Auto service · Property viewing · Clinic. Preset services and hours load.
3. Edit services (name, duration, price, deposit rule).
4. Add staff (name; optional invite by email) and their hours.
5. Get the booking link `switchboard…/b/<slug>` + "Copy link" + QR code.

## Acceptance criteria

- [ ] Slug unique, auto-generated from name, editable once
- [ ] Every preset field editable before saving
- [ ] Owner lands on an empty day view with "Share your booking link" empty state
- [ ] Playwright test covers the whole flow; axe clean
