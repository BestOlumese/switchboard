# Concern — Money handling and compliance

- **Pooled funds:** collecting deposits into Switchboard's Kora account and paying out to businesses makes us an intermediary. Sandbox only for the challenge. Production path: each business uses its own Kora merchant account (Switchboard as platform), or a licensed split-settlement arrangement. Prepare this answer for judges.
- **Kobo integers only**, conversion only in `packages/kora`. Lint rule bans `parseFloat` and `* 100` outside it.
- **Audit log** on every money state change, with before/after.
- **Customer data:** phone numbers are personal data (NDPA 2023). Store only what's needed, mask for staff role, no export without owner action, delete on request.
- **Fees shown honestly:** customer always sees the total they must transfer.
