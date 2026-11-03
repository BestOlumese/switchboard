# 13 — Pitch and build in public

## Posting plan (≥ 2 posts/week each, tag Korabytes, Kora, #KorabytesBuildInPublic)

| Week | A (engineering) | B (product) |
|------|-----------------|-------------|
| Nov 3–9 | "Why we switched to Switchboard" · "One Postgres line that makes double-booking impossible" | Problem post with owner quotes · Design direction (the hold band) |
| Nov 10–16 | "Paying a deposit without trusting the webhook" (Kora re-verify) · WhatsApp agent clip | First full booking video · Dashboard walkthrough |
| Nov 17–20 | Chaos test video: 100 bots, 10 slots, 0 double-bookings · Lessons | Pitch teaser · Thank-you + repo link |

Every post: one clip or screenshot, one sentence of what changed, one sentence of what's next. GitHub repo public with progress visible in commits.

## Showcase script (5 minutes)

1. **Problem (40s).** "Saturday 2pm. Your barber turns away a walk-in for a customer who booked on WhatsApp — and never shows. That's ₦3,000 gone, every week." Show the owner quotes.
2. **Live booking (90s).** A judge messages the WhatsApp number: "I wan do low cut tomorrow evening." Agent offers times → hold → Kora account. We trigger the sandbox transfer → the hold band floods indigo on the projector dashboard → judge's phone gets "Confirmed".
3. **Chaos (90s).** "Now 100 customers want the same 10 slots, and Kora's webhooks arrive three times, out of order, some late." Run it. Counters: 0 overlaps, 0 double-counted payments, late payers refunded.
4. **How (40s).** Exclusion constraint · idempotency keys · webhook re-verification · Inngest holds. "The AI talks. The database decides."
5. **Business (40s).** Pricing, unit economics, path to auto service / viewings / clinics, then the "safe AI actions" platform.

## Backup plan

- Recorded video of steps 2–3 on a laptop, offline.
- Local Docker stack with mock-kora on the laptop if venue Wi-Fi dies.
- Second WhatsApp-registered phone in case a judge's number wasn't added.
- Permanent (System User) WhatsApp token verified the night before.

## Likely judge questions

| Q | A |
|---|---|
| Who holds the deposit money? | Sandbox now. Production: business connects its own Kora account or a licensed split-settlement model; we never pool funds unlicensed. |
| What if the AI hallucinates a booking? | It can't confirm — confirmation messages are templates rendered only from a `confirmed` DB row. |
| Why not just Calendly? | Calendly doesn't live in WhatsApp, doesn't take naira bank transfers, and doesn't speak "I wan book". |
| Cost per conversation? | Show measured tokens/conversation from logs × model price. |
| Why would a barber pay? | One prevented no-show ≈ half a month of Pro. |
