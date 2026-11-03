# Switchboard

AI booking agent for Nigerian salons and barbers — on WhatsApp and web chat. Books real slots, collects a Kora deposit, and never confirms a booking it can't prove.

> Korabytes "Build in Public" Challenge · Covenant University × Kora · Nov 2026

## Quick start (local, all Docker)

```bash
cp .env.example .env          # local values already point at Docker services
pnpm docker:up                # postgres, api, web, inngest dev server, mock-kora
pnpm db:migrate && pnpm db:seed
open http://localhost:3000    # web
open http://localhost:8288    # Inngest dev UI
open http://localhost:4010    # mock Kora control panel
```

## Docs

Start at [`AGENTS.md`](./AGENTS.md), then [`docs/00-overview.md`](./docs/00-overview.md).

| Doc | What it covers |
|-----|----------------|
| 00-overview | Problem, pitch, locked decisions |
| 01-architecture | System diagram, request flows |
| 02-tech-stack | Every library and why |
| 03-data-model | Tables, constraints, state machines |
| 04-booking-engine | Holds, overlap prevention, idempotency |
| 05-kora-integration | Deposits, webhooks, refunds, payouts, billing |
| 06-ai-agent | Tools, prompts, guardrails |
| 07-whatsapp | Meta Cloud API, 24h window, templates |
| 08-environments-and-docker | Local Docker vs preview vs prod |
| 09-ci-cd | GitHub Actions, Neon branches, Vercel deploys |
| 10-testing-strategy | Unit → integration → e2e → Lighthouse → k6 → chaos |
| 11-frontend-design | Visual identity, tokens, copy rules |
| 12-team-and-timeline | Who does what, by when |
| 13-pitch-and-build-in-public | Showcase script, posting plan |

`docs/phases/` — build order · `docs/features/` — specs · `docs/concerns/` — known failure modes
