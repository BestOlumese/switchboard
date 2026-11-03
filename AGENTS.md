# AGENTS.md — Switchboard

You are an AI coding agent working on **Switchboard**: an AI booking agent on WhatsApp and web chat for Nigerian salons and barbers. It books real slots, takes a **Kora** deposit to stop no-shows, and **never confirms a booking it cannot prove**.

Built for the Korabytes "Build in Public" Challenge (Covenant University × Kora). Hard deadline: **Nov 20, 2026** (showcase pitch). Team of 2.

---

## 1. Read order (do this before touching code)

1. `docs/00-overview.md` — product, problem, decisions already locked
2. `docs/01-architecture.md` — system shape and boundaries
3. `docs/04-booking-engine.md` — **the correctness core. Read fully.**
4. The phase you are working in: `docs/phases/`
5. The feature spec you are implementing: `docs/features/`
6. Relevant concerns: `docs/concerns/` (each one is a known way to break the product)

If a doc and the code disagree, **stop and flag it**. Do not silently pick one.

---

## 2. Non-negotiable invariants

Breaking any of these is a failed task, even if tests pass.

| # | Invariant | Enforced by |
|---|-----------|-------------|
| I1 | A staff member can never have two overlapping `held`/`confirmed` bookings | Postgres `EXCLUDE USING gist` constraint — not app code |
| I2 | A booking becomes `confirmed` only after a Kora `charge.success` webhook **and** a successful re-verify via Kora transaction query | `payments` state machine |
| I3 | Every Kora event is applied at most once | `UNIQUE (provider, provider_event_key)` on `payment_events` |
| I4 | Every agent tool call that writes is idempotent | `idempotency_key` column + unique index on every write table the agent touches |
| I5 | The agent never tells a customer "booked/confirmed" unless the DB row says `confirmed` | Agent reply templates read status from DB; LLM never free-texts confirmation |
| I6 | Money is stored as **integer kobo** (`bigint`). Conversion to Kora's naira amount happens only in `packages/kora` | Type `Kobo` brand + lint rule |
| I7 | Timeout ≠ failure. An unknown provider outcome is stored as `pending_verification`, never as success or failure | Reconciliation job |
| I8 | Secrets never reach the client bundle or logs | `packages/env` split server/client schemas; log redaction |

---

## 3. Repo map

```
apps/
  web/          Next.js 16 App Router — dashboard, public booking pages, web chat widget, chaos dashboard
  api/          Hono on Vercel — REST API, webhooks (Kora, WhatsApp), Better Auth, Inngest handler
  mock-kora/    Local-only fake Kora (Hono). Signs webhooks exactly like Kora. Chaos controls.
packages/
  db/           Drizzle schema, migrations, seed, raw SQL constraints
  booking/      Pure booking domain: availability, holds, state machines. No HTTP, no LLM.
  kora/         Kora client + webhook verification + amount conversion
  agent/        Vercel AI SDK agent: tools, prompts, guardrails
  whatsapp/     Meta Cloud API client + webhook parsing
  env/          Zod env schemas (server / client / test)
  ui/           shadcn components + design tokens
  config/       tsconfig, biome, vitest presets
infra/docker/   Dockerfiles for local dev
load/k6/        Load and chaos scripts
.github/workflows/  CI/CD
```

Dependency direction: `apps → packages`. `booking` depends only on `db` types. `agent` calls `booking` through tools, never the DB directly.

---

## 4. Commands

```bash
pnpm docker:up          # whole stack in Docker: postgres, api, web, inngest, mock-kora
pnpm docker:down
pnpm db:migrate         # apply packages/db/sql migrations (uses DATABASE_URL_UNPOOLED)
pnpm db:seed            # demo salon "Fade Republic, Ota" + staff + services
pnpm dev                # turbo dev (inside container or host)
pnpm lint               # biome check
pnpm typecheck          # tsc --noEmit across workspace
pnpm test               # vitest unit
pnpm test:int           # vitest integration (needs Docker Postgres)
pnpm test:e2e           # playwright
pnpm lhci               # lighthouse CI against local build
pnpm load:booking       # k6 slot contention
pnpm load:webhooks      # k6 webhook storm
pnpm chaos              # 100 bots vs 10 slots + duplicate/late webhooks, asserts invariants
```

---

## 5. Conventions

- **TypeScript strict**, `noUncheckedIndexedAccess: true`. No `any`. No non-null `!` without a comment.
- **Biome** for lint + format. No ESLint/Prettier.
- Validate every boundary with **Zod** (HTTP bodies, webhook payloads, env, LLM tool args).
- Errors: domain functions return `Result<T, DomainError>`; HTTP layer maps to status codes. Never throw across package boundaries.
- Time: store `timestamptz` UTC. Display in `Africa/Lagos`. Use `date-fns-tz`. Never `new Date(string)` on user input.
- IDs: `uuid v7` (sortable). Public references (Kora `reference`) are `sb_dep_<ulid>`.
- One Drizzle migration per PR max. Migrations are forward-only.
- Logging: `pino` JSON, include `request_id`, `business_id`, `booking_id`. Redact `authorization`, `x-korapay-signature`, phone numbers (last 4 only).
- Copy in the UI: sentence case, active verbs, no "Submit". See `docs/11-frontend-design.md`.

---

## 6. Definition of done (every task)

- [ ] Feature spec acceptance criteria all pass
- [ ] Unit tests for domain logic; integration test if it touches DB or a webhook
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm test:int` green locally in Docker
- [ ] No invariant in §2 weakened
- [ ] New env vars added to `packages/env`, `.env.example`, and `docs/08-environments-and-docker.md`
- [ ] Public pages still score Lighthouse ≥ 95 performance, 100 a11y / best practices / SEO
- [ ] Phase checklist updated

---

## 7. Do not

- Do not use the `neon-http` driver. The booking engine needs interactive transactions (`SELECT … FOR UPDATE`). Use `pg` Pool everywhere.
- Do not let the LLM decide prices, deposit amounts, or availability. Tools return them; the model relays them.
- Do not call real Kora, WhatsApp, or LLM APIs from tests. Use `mock-kora` and the AI SDK mock model.
- Do not deploy from a laptop. Only GitHub Actions deploys.
- Do not run load tests against production Neon.
- Do not add a dependency without noting why in the PR description.
