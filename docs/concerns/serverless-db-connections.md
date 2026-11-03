# Concern — Serverless DB connections and transactions

**Risk:** Vercel functions scale out and exhaust Postgres connections; the Neon HTTP driver can't do interactive transactions, which the booking engine needs.

**Handling:**

- Use `pg` Pool with Neon's **pooled** connection string (`-pooler` host) in preview/prod; small pool per instance (`max: 5`); `@vercel/functions` `attachDatabasePool` so idle clients close on suspend.
- Migrations use the **unpooled** URL (PgBouncer transaction mode breaks some DDL/session features).
- Avoid session-level features (`SET`, advisory session locks, prepared statements across transactions) — PgBouncer transaction mode.
- Neon free tier autosuspends: first request after idle is slow. Warm the prod DB with a health ping 10 min before the showcase.
- Integration tests run against plain Postgres 17 locally; one CI job runs the integration suite against the PR's Neon branch to catch driver differences.
