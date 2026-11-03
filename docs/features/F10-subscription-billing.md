# F10 — Subscription billing

**Phase:** P5 · **Owner:** A (API), B (UI)

## Acceptance criteria

- [ ] Starter limits enforced: 30 agent conversations/month, web chat only (no WhatsApp)
- [ ] "Upgrade to Pro" → Kora Checkout redirect → webhook → plan `pro` active for 30 days
- [ ] Renewal link sent 3 days before period end; 3-day grace, then back to Starter (no data loss)
- [ ] Billing page: current plan, period end, payment history
- [ ] Deposit fee (Switchboard's cut) shown transparently on payout statements
