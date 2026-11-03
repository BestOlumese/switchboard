# F11 — Chaos dashboard

**Phase:** P5 · **Owner:** B (UI), A (runner)

Spec: `docs/10-testing-strategy.md` → Chaos suite.

## Acceptance criteria

- [ ] `/chaos` (protected by chaos token), dark projector mode, readable from the back of a room (slot times ≥ 39px)
- [ ] 10 slot tiles with live hold bands; bot activity log; five invariant counters, each with pass/fail
- [ ] "Run chaos" button starts a run on a dedicated seeded business; "Reset" clears it
- [ ] Controls for chaos knobs (duplicates, delay, drop rate, query timeouts) with sensible presets
- [ ] Runs against mock-kora on preview/prod for the stage (real Kora sandbox for the single live booking)
- [ ] Whole run finishes in ≤ 60s
