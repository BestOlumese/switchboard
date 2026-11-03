// In-memory only: mock-kora is a test double, restarted freely. `POST /_control/reset` wipes it.

type ChaosConfig = {
  /** Deliver each webhook this many times. */
  duplicate: number;
  /** Shuffle delivery order across pending webhooks. */
  shuffle: boolean;
  delayMs: [min: number, max: number];
  /** Fraction of webhooks never delivered (0–1). */
  dropRate: number;
  /** Fraction of transaction queries that hang past the client timeout (0–1). */
  queryTimeoutRate: number;
};

const calmChaos: ChaosConfig = {
  duplicate: 1,
  shuffle: false,
  delayMs: [0, 0],
  dropRate: 0,
  queryTimeoutRate: 0,
};

export type MockState = {
  /** Charges by Kora `reference`. Filled in P2. */
  charges: Map<string, unknown>;
  /** Every webhook we attempted, for the chaos suite's "duplicates sent" count. */
  webhookLog: unknown[];
  /** Outbound WhatsApp messages captured by the `/_wa` stub. */
  waOutbox: unknown[];
  chaos: ChaosConfig;
};

export function createState(): MockState {
  return { charges: new Map(), webhookLog: [], waOutbox: [], chaos: { ...calmChaos } };
}
