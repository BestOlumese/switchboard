# P6 — Hardening + pitch (Nov 18–20)

## Tasks

- [ ] Both: bug bash from a fresh phone on 3G throttling
- [ ] B: Lighthouse pass on all public pages in prod (≥ 95 / 100 / 100 / 100)
- [ ] A: OpenTelemetry traces + error alerts; dashboard of agent cost per conversation
- [ ] A: Rate limits on public endpoints (per IP + per phone) — Postgres-backed token bucket
- [ ] A: Security review: webhook signatures, tenant filters on every query, secrets not in client bundle (`next build` output grep), CSP headers
- [ ] B: Pitch deck (5 slides max) + recorded backup video
- [ ] Both: rehearse the 5-minute script 3 times; add judges' numbers to WhatsApp test recipients the night before
- [ ] Both: freeze `main` 24h before showcase — only demo-critical fixes

## Exit criteria

- Full demo runs on prod 3 times in a row without touching a terminal
- Offline backup (local Docker + video) tested on the presenting laptop
