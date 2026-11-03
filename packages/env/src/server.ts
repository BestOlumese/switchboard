import { z } from 'zod';

// One schema per concern. Apps compose only what they use, so a test or tool
// doesn't need every secret just to boot (e.g. migrations need only the DB URL).

const postgresUrl = z.url({ protocol: /^postgres(ql)?$/, error: 'must be a postgres:// URL' });
const intFromString = (def: number) => z.coerce.number().int().positive().default(def);

export const nodeSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

/** Runtime pool. Neon *pooled* URL in preview/prod. */
export const dbSchema = z.object({ DATABASE_URL: postgresUrl });

/** Migrations only. Neon *direct* URL: PgBouncer transaction mode breaks some DDL. */
export const migrateSchema = z.object({ DATABASE_URL_UNPOOLED: postgresUrl });

export const authSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32, 'must be at least 32 characters'),
  BETTER_AUTH_URL: z.url(),
});

export const koraSchema = z.object({
  KORA_BASE_URL: z.url(),
  KORA_SECRET_KEY: z.string().startsWith('sk_', 'must start with sk_'),
  KORA_PUBLIC_KEY: z.string().startsWith('pk_', 'must start with pk_'),
});

export const whatsappSchema = z.object({
  WA_API_BASE_URL: z.url(),
  WA_PHONE_NUMBER_ID: z.string().min(1),
  WA_ACCESS_TOKEN: z.string().min(1),
  WA_APP_SECRET: z.string().min(1),
  WA_VERIFY_TOKEN: z.string().min(1),
});

export const inngestSchema = z
  .object({
    INNGEST_DEV: z.enum(['0', '1']).optional(),
    INNGEST_BASE_URL: z.url().optional(),
    INNGEST_EVENT_KEY: z.string().min(1).optional(),
    INNGEST_SIGNING_KEY: z.string().min(1).optional(),
  })
  .refine((e) => e.INNGEST_DEV === '1' || (e.INNGEST_EVENT_KEY && e.INNGEST_SIGNING_KEY), {
    message: 'INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY are required unless INNGEST_DEV=1',
    path: ['INNGEST_SIGNING_KEY'],
  });

const llmKeyFor = {
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
  groq: 'GROQ_API_KEY',
} as const;

export const llmSchema = z
  .object({
    LLM_PROVIDER: z.enum(['mock', 'anthropic', 'google', 'groq']),
    LLM_MODEL: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
  })
  .superRefine((e, ctx) => {
    if (e.LLM_PROVIDER === 'mock') return;
    const key = llmKeyFor[e.LLM_PROVIDER];
    if (!e[key])
      ctx.addIssue({
        code: 'custom',
        path: [key],
        message: `required when LLM_PROVIDER=${e.LLM_PROVIDER}`,
      });
    if (!e.LLM_MODEL)
      ctx.addIssue({
        code: 'custom',
        path: ['LLM_MODEL'],
        message: 'required unless LLM_PROVIDER=mock',
      });
  });

export const bookingSchema = z.object({
  HOLD_MINUTES: intFromString(15),
  MIN_LEAD_MINUTES: intFromString(30),
  SLOT_STEP_MINUTES: intFromString(15),
});

/** Everything apps/api needs at runtime. */
export const apiSchema = z
  .object({
    ...nodeSchema.shape,
    ...dbSchema.shape,
    ...authSchema.shape,
    ...koraSchema.shape,
    ...whatsappSchema.shape,
    ...bookingSchema.shape,
    PORT: intFromString(4000),
    PUBLIC_APP_URL: z.url(),
    CHAOS_TOKEN: z.string().min(1).optional(),
  })
  .and(inngestSchema)
  .and(llmSchema);
export type ApiEnv = z.infer<typeof apiSchema>;

/** Server side of apps/web (rewrites, metadata). Never imported by client components. */
export const webSchema = z.object({
  ...nodeSchema.shape,
  API_ORIGIN: z.url(),
  PUBLIC_APP_URL: z.url(),
});
export type WebEnv = z.infer<typeof webSchema>;

/** apps/mock-kora (local + CI only). */
export const mockKoraSchema = z.object({
  PORT: intFromString(4010),
  WEBHOOK_TARGET: z.url().default('http://localhost:4000/webhooks/kora'),
  WA_WEBHOOK_TARGET: z.url().default('http://localhost:4000/webhooks/whatsapp'),
  WA_APP_SECRET: z.string().min(1),
  KORA_SECRET_KEY: z.string().startsWith('sk_'),
});
export type MockKoraEnv = z.infer<typeof mockKoraSchema>;
