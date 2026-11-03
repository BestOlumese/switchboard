# 02 — Tech stack

Pin exact versions in `package.json` when scaffolding. Check each library's current major before installing.

## Monorepo

| Tool | Why |
|------|-----|
| pnpm workspaces | Fast, strict, good Docker layer caching |
| Turborepo | Task graph + Vercel remote cache (free) |
| Biome | Lint + format in one fast binary |
| TypeScript strict | Shared types across web/api/packages |

## apps/web

| Library | Use |
|---------|-----|
| Next.js (App Router, latest stable) | Dashboard, public booking pages, chat widget |
| React Server Components + Server Actions only for UI-local mutations | Data goes through API |
| Tailwind CSS v4 + shadcn/ui | Components (restyled to our tokens) |
| TanStack Query | Client data cache, polling for inbox/chaos dashboard |
| Zustand | Small client state (chat widget, filters) |
| `next/font` (self-hosted) | Zero layout shift, Lighthouse friendly |
| `next/image` | Optimized images |

## apps/api

| Library | Use |
|---------|-----|
| Hono | API framework, runs natively on Vercel |
| `@hono/zod-validator` | Request validation |
| Better Auth | Owner/staff auth, organizations (business = org), roles |
| Inngest SDK | Durable functions |
| pino | Structured logs |
| OpenTelemetry (`@vercel/otel`) | Traces |

## Data

| Library | Use |
|---------|-----|
| PostgreSQL 17 (Docker locally) / Neon (preview, prod) | Source of truth |
| Drizzle ORM + drizzle-kit | Schema, migrations |
| `pg` (node-postgres) Pool | **Interactive transactions required** — never `neon-http` |
| `btree_gist` extension | Overlap exclusion constraint |

## AI

| Library | Use |
|---------|-----|
| Vercel AI SDK (`ai`) | `generateText` with tools, provider-agnostic |
| Provider packages (`@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/groq`) | Swapped by `LLM_PROVIDER` + `LLM_MODEL` env |
| `ai/test` mock model | Deterministic agent tests in CI |

## Integrations

| Service | Use |
|---------|-----|
| Kora | Bank-transfer deposits, refunds, payouts, Checkout for subscriptions |
| Meta WhatsApp Cloud API | Messaging (test number for demo) |
| Inngest Cloud (free tier) | Prod/preview durable functions |
| Inngest Dev Server (Docker) | Local |

## Testing & quality

| Tool | Use |
|------|-----|
| Vitest | Unit + integration |
| fast-check | Property tests on booking invariants |
| Playwright | E2E + authenticated page checks |
| Lighthouse CI (`@lhci/cli`) | Perf/a11y/BP/SEO budgets on every PR |
| k6 (Docker image `grafana/k6`) | Load + webhook storm |
| `@axe-core/playwright` | Accessibility in E2E |
| Knip | Dead code / unused deps |

## Why not…

- **Rust/Go core:** 17 days, two people, TS is the team's strongest stack. Correctness lives in Postgres constraints, not the language.
- **Redis:** Postgres row locks + constraints cover our concurrency; Inngest covers queues.
- **Prisma:** No first-class exclusion constraints; Drizzle lets us drop to SQL cleanly.
