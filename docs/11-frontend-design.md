# 11 — Frontend design

## Subject, audience, job

- **Subject:** appointments at a Nigerian barbershop or salon — the chalkboard of names, the "who's next?", the WhatsApp voice note asking "you dey free by 4?"
- **Audiences:** (1) the customer on a mid-range Android with patchy data, booking in under a minute; (2) the owner glancing at the day between clients; (3) judges watching the chaos dashboard on a projector.
- **Primary job:** make it obvious, at every moment, **whether a slot is held, confirmed, or free** — and how long a hold has left.

## The one memorable thing: the hold band

A held slot carries a **danfo-yellow band that drains** left-to-right over its 15 minutes. When payment verifies, the band floods indigo and the slot locks as confirmed (one 300ms transition — the only orchestrated motion in the product). Same element everywhere: the customer's deposit card in chat, the owner's day calendar, every slot tile on the chaos dashboard. On stage, 100 bots fighting over 10 slots reads instantly as yellow bands appearing, draining, and either turning indigo or vanishing.

Everything else stays quiet.

## Tokens

### Colour

| Name | Hex | Use |
|------|-----|-----|
| Adire indigo | `#22306B` | Brand, primary buttons, confirmed state |
| Night indigo | `#151B3F` | Body text on light, dark-mode surface |
| Harmattan paper | `#F5F6FA` | App background (cool, not cream) |
| Danfo yellow | `#F5B700` | **Held** state and countdown only — never decoration |
| Palm green | `#17805A` | Paid / success toasts, money dashboard positives |
| Slate | `#5D6680` | Secondary text, free slots outline |
| Kola red | `#B3261E` | Errors, no-shows |

Yellow on paper fails contrast for text → the band is never text-bearing; labels sit beside it in Night indigo. All text pairs ≥ 4.5:1 (checked by axe in CI).

### Type

- **Familjen Grotesk** (600/700) — headings, slot times, money figures. Times are the hero content, set large with tabular figures.
- **Atkinson Hyperlegible Next** (400/500) — body and UI. Chosen for legibility on small, low-quality screens.
- Scale (1.25): 13 / 16 / 20 / 25 / 31 / 39 px. Body 16px, line-height 1.5, max 70ch.
- Self-host via `next/font/google` with `display: 'swap'` and only the weights listed.

### Shape & space

- 4px grid. Radius: 6px inputs/buttons, 10px slot tiles, 16px sheets. No shadows on cards; hierarchy from borders (`#DDE0EA`) and spacing.

## Layouts

**Public booking page (`/b/[slug]`), mobile-first, left-aligned:**

```
┌─────────────────────────┐
│ Fade Republic           │  name, area, open now
│ Ota · Open till 8pm     │
├─────────────────────────┤
│ Low cut        ₦3,000   │  service rows (tap to pick)
│ 30 min · ₦1,000 deposit │
│ Braids        ₦15,000   │
├─────────────────────────┤
│ Sat 8 Nov               │  day strip (scroll)
│ [10:00] [10:30] [13:15] │  time chips
├─────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓░░░  12:41 left│  hold band + deposit card
│ Transfer ₦1,015 to      │
│ Wema 9912345678         │  [Copy account number]
└─────────────────────────┘
```

**Owner dashboard, day view:** staff as columns, time down the left, bookings as tiles with hold bands. Right side: inbox with conversations needing a human pinned on top. Collapses to a single staff column + bottom-sheet inbox on mobile.

**Chaos dashboard (projector):** 10 large slot tiles in a row, bot activity as a scrolling log underneath, and five invariant counters with pass/fail. Dark mode (Night indigo surface) for projector contrast.

## Copy rules

- Name things as users would: "Deposit", "Held for you", "Confirmed", "Hand over to staff". Not "payment intent", "webhook", "escalation".
- Buttons say what happens: "Hold this time", "Copy account number", "Reply as staff", "Refund deposit". Toast echoes the verb: "Deposit refunded".
- Errors give the fix: "That time just got taken. Here are the next three."
- Empty states invite action: "No bookings today. Share your booking link" + copy button.
- Sentence case everywhere. No all-caps labels, no eyebrows above headings, no "→" on buttons.

## Performance rules (Lighthouse ≥ 95)

- Booking page is a Server Component; only the time-chip picker and deposit card are client components.
- No client-side chart lib on public pages. Dashboard charts lazy-loaded.
- Images: business logo only, `next/image`, sized.
- Fonts: 2 families, ≤ 4 weight files total, preloaded.
- `prefers-reduced-motion`: band shows remaining time as text and steps instead of animating.
- Visible focus ring: 2px Adire indigo + 2px offset on every interactive element.
