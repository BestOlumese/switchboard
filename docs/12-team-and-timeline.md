# 12 — Team and timeline

## Roles (2 people)

| | **A — Backend & infra** | **B — Frontend & product** |
|---|---|---|
| Owns | `packages/db`, `booking`, `kora`, `agent`, `whatsapp`, `apps/api`, `apps/mock-kora`, CI/CD, k6, chaos suite | `apps/web`, `packages/ui`, design tokens, booking page, dashboard, chat widget, chaos dashboard UI, Lighthouse, Playwright, pitch deck |
| Reviews | B's API-touching PRs | A's PRs (second pair of eyes on invariants) |
| Posts | Engineering threads (constraints, chaos test) | Demo clips, design process, user quotes |

Contract between A and B: `apps/api` OpenAPI (generated from Zod via `hono-openapi`) + typed client in `packages/api-client`. B can build against mock responses before endpoints exist.

## Timeline (today = Tue Nov 3, showcase ≈ Nov 20)

| Dates | Phase | Demo-able result |
|-------|-------|------------------|
| Nov 3–4 | [P0 Foundation](./phases/p0-foundation.md) | `docker:up` works, CI green, preview deploy with Neon branch, empty Lighthouse 100 page |
| Nov 5–7 | [P1 Booking engine](./phases/p1-booking-engine.md) | 100 parallel holds → 1 winner, in a test |
| Nov 7–9 | [P2 Kora deposits](./phases/p2-kora-deposits.md) | Book on web page, pay in sandbox, slot confirms |
| Nov 9–12 | [P3 Agent + channels](./phases/p3-agent-channels.md) | Book over WhatsApp end to end |
| Nov 12–15 | [P4 Business dashboard](./phases/p4-dashboard.md) | Owner sees day, takes over a chat, CRM, multi-staff |
| Nov 15–17 | [P5 Money ops + chaos](./phases/p5-money-chaos.md) | Refunds, payouts, subscription, chaos dashboard live |
| Nov 18–20 | [P6 Hardening + pitch](./phases/p6-hardening-pitch.md) | Rehearsed demo, backups, deck |

Each phase ends with a post (see `13-pitch-and-build-in-public.md`).

## Day-1 external tasks (blocking, do today)

- [ ] Email Kora support: enable Pay with Bank Transfer via API (+ refunds, payouts) on the sandbox account
- [ ] Meta app + WhatsApp test number; submit 3 message templates
- [ ] Create Neon project, Vercel projects (web, api), Inngest app, connect Inngest ↔ Vercel integration
- [ ] Register domain or use `*.vercel.app` for now
- [ ] Ask 3 barbers/salon owners near campus: "How many no-shows a week? What does one cost you?" (pitch quotes)
