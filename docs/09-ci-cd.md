# 09 — CI/CD

GitHub Actions is the only thing that deploys. Vercel Git auto-deploy is **disabled** (`vercel.json → "git": { "deploymentEnabled": false }` in both apps).

## Pipeline

```
PR opened / pushed                                        merge to main
─────────────────                                         ─────────────
ci.yml                                                    production.yml
 ├─ install (pnpm, turbo cache)                            ├─ same quality gates (fast, cached)
 ├─ lint (biome) · typecheck · knip                        ├─ drizzle migrate → Neon main (unpooled URL)
 ├─ unit tests (vitest + coverage)                         ├─ vercel deploy --prod  api
 ├─ integration tests (service: postgres:17 + mock-kora)   ├─ vercel deploy --prod  web
 ├─ build all apps                                         ├─ smoke tests against prod URLs
 └─ e2e (playwright vs docker compose stack)               └─ lighthouse (prod) → summary
        │
preview.yml (needs ci)
 ├─ create Neon branch  pr-<n>   (neondatabase/create-branch-action)
 ├─ drizzle migrate → branch
 ├─ seed demo business
 ├─ vercel pull/build/deploy  api (preview, DATABASE_URL=branch)
 ├─ vercel pull/build/deploy  web (preview, API_ORIGIN=api preview url)
 ├─ lighthouse CI against preview URLs (fails PR under budget)
 ├─ k6 smoke (light, 1 min) against preview
 └─ PR comment: preview links + Lighthouse scores + k6 p95

pr-cleanup.yml  (PR closed) → delete Neon branch pr-<n>

load.yml  (manual workflow_dispatch + nightly) → full k6 + chaos suite against docker stack in CI
```

## Required GitHub secrets

| Secret | Use |
|--------|-----|
| `VERCEL_TOKEN`, `VERCEL_ORG_ID` | Vercel CLI |
| `VERCEL_PROJECT_ID_WEB`, `VERCEL_PROJECT_ID_API` | Two projects, one repo |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Lets Lighthouse/k6 reach protected preview URLs (`x-vercel-protection-bypass` header) |
| `NEON_API_KEY`, `NEON_PROJECT_ID` (var) | Branch create/delete |
| `DATABASE_URL_PROD_UNPOOLED` | Prod migrations only |
| `TURBO_TOKEN`, `TURBO_TEAM` (var) | Remote cache |
| `LHCI_GITHUB_APP_TOKEN` (optional) | Lighthouse status checks |

Production runtime secrets (Kora, WhatsApp, LLM, Better Auth) live **only in Vercel** env, not GitHub.

## Branch protection on `main`

- Require PR, 1 approval (the other teammate)
- Required checks: `preview / ci / quality`, `preview / ci / integration`, `preview / ci / e2e`, `preview / lighthouse`
- `ci.yml` is a reusable workflow (`workflow_call` only) — called by `preview.yml` on PRs and `production.yml` on `main`, so it runs once per event and deploys always wait for it

## Webhooks on preview deployments

Vercel Deployment Protection blocks unauthenticated requests to previews — including Kora's webhooks. Fix:

- Kora: each charge sets its own `notification_url`, so preview charges use `${API_PREVIEW_URL}/webhooks/kora?x-vercel-protection-bypass=${VERCEL_AUTOMATION_BYPASS_SECRET}`. Webhooks reach the right preview and its Neon branch.
- Meta WhatsApp has **one** webhook URL per app → point it at production only. Test WhatsApp on preview with `pnpm wa:simulate --target <preview-url>`.
- Linear history (squash merge), conventional commit titles

## Migration safety

- Forward-only, additive first (expand → migrate code → contract in a later PR).
- `production.yml` migrates **before** deploying, so new code never runs on an old schema. Old code must tolerate the new schema (that's why additive-first).
- Preview branches let you test the migration on a copy of prod schema before merge.

## Lighthouse budgets (`lighthouserc.cjs`)

| Category | Minimum |
|----------|---------|
| Performance | 0.95 |
| Accessibility | 1.0 |
| Best practices | 1.0 |
| SEO | 1.0 (public pages only) |

Plus resource budgets: LCP ≤ 2.0s, CLS ≤ 0.02, TBT ≤ 150ms, JS on booking page ≤ 120 KB gzip. Pages: `/` landing, `/b/fade-republic` booking page, `/b/fade-republic/chat`, `/login`. Authenticated dashboard pages are audited in Playwright with a logged-in storage state (accessibility + basic perf), not LHCI.

Tested with mobile emulation + simulated slow 4G, because that's our customers' reality.
