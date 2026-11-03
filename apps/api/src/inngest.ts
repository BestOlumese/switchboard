import { Inngest, type InngestFunction } from 'inngest';

// Dev vs cloud is picked from INNGEST_DEV / INNGEST_BASE_URL / INNGEST_*_KEY (validated in @switchboard/env).
export const inngest = new Inngest({ id: 'switchboard' });

// Hold expiry, reminders, reconciliation and the outbox relay register here from P1 on.
export const functions: InngestFunction.Any[] = [];
