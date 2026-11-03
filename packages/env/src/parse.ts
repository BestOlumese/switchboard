import type { z } from 'zod';

type Source = Record<string, string | undefined>;

export class EnvError extends Error {
  override name = 'EnvError';
}

/**
 * Validate env at boot. Throws on purpose: a misconfigured process must not start (docs/08).
 * The message lists variable names and reasons only, never values (I8).
 *
 * `SKIP_ENV_VALIDATION=1` is for `pnpm build` in CI, where runtime secrets don't exist.
 */
export function parseEnv<S extends z.ZodType>(schema: S, source: Source = process.env): z.infer<S> {
  if (source.SKIP_ENV_VALIDATION === '1') {
    // Build-time only: nothing reads these values during a build.
    return source as z.infer<S>;
  }
  const result = schema.safeParse(source);
  if (result.success) return result.data;

  const lines = result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`);
  throw new EnvError(`Invalid environment variables:\n${lines.join('\n')}`);
}
