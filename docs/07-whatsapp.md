# 07 — WhatsApp (Meta Cloud API)

## Setup (demo)

1. Meta developer app → add WhatsApp product → you get a **test phone number** and a temporary token.
2. Add up to 5 recipient phone numbers (team + judges' phones on showcase day — add them the night before).
3. Create a **System User** permanent token for preview/prod (temporary tokens expire in ~24h — a classic demo-day failure).
4. Webhook URL: `https://api.<domain>/webhooks/whatsapp`, verify token = `WA_VERIFY_TOKEN`, subscribe to `messages`.

## Webhook handler

- `GET` → echo `hub.challenge` if `hub.verify_token` matches.
- `POST` → verify `X-Hub-Signature-256` (HMAC-SHA256 of raw body with `WA_APP_SECRET`), insert message with `provider_message_id` unique (Meta redelivers), send Inngest event, return `200` immediately.
- Status callbacks (sent/delivered/read/failed) update `messages`.

## 24-hour customer service window

- Free-form replies are allowed only within 24h of the customer's last message. Track `conversations.wa_window_expires_at`.
- **Reminders (24h / 2h before)** usually fall outside the window → must use **approved message templates**:
  - `booking_reminder` — "Hi {{1}}, reminder: {{2}} at {{3}} on {{4}}. Reply 1 to keep, 2 to reschedule."
  - `booking_confirmed` — "{{1}}, you're booked for {{2}} at {{3}}, {{4}}. Deposit ₦{{5}} received."
  - `deposit_refunded`
- Submit templates on day 1 — approval can take time. Fallback if not approved: reminders through web push/SMS are out of scope, so show reminders on stage within the window.

## Local development

WhatsApp can't reach Docker. Locally:

- Web chat uses the same agent pipeline (`channel = 'web_chat'`).
- `pnpm wa:simulate "I wan book low cut tomorrow"` posts a correctly signed fake Meta payload to the local webhook.
- Outbound sends go to `WA_API_BASE_URL`, which points to a stub in `mock-kora` (`/_wa/messages`) that logs them.
