import { z } from 'zod';

/**
 * Values allowed in the browser bundle. Only `NEXT_PUBLIC_*` keys, and never a secret (I8).
 * Kept separate from server.ts so a client import can't pull server schemas in.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().optional(),
});
export type ClientEnv = z.infer<typeof clientSchema>;
