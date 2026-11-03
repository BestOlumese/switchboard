# Concern — Time and timezones

- Store `timestamptz` (UTC); business timezone `Africa/Lagos` (UTC+1, no DST — still always use a tz library so other regions work later).
- CI runners are UTC, laptops are Lagos → tests freeze time with `vi.setSystemTime` and assert in explicit zones.
- "Tomorrow evening" is resolved by a tool (`find_slots` with `part_of_day`) in the business's timezone, never by the model doing date maths.
- Ranges are half-open `[start, end)` so back-to-back bookings don't collide.
- Postgres `now()` is the clock for hold expiry, not the app server's clock.
