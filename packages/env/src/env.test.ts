import { describe, expect, it } from 'vitest';
import { clientSchema } from './client.ts';
import { apiSchema, EnvError, inngestSchema, llmSchema, migrateSchema, parseEnv } from './index.ts';

const localApi = {
  DATABASE_URL: 'postgres://switchboard:switchboard@postgres:5432/switchboard',
  PUBLIC_APP_URL: 'http://localhost:3000',
  BETTER_AUTH_SECRET: 'local-dev-secret-change-me-32-characters-min',
  BETTER_AUTH_URL: 'http://localhost:3000',
  KORA_BASE_URL: 'http://mock-kora:4010/merchant',
  KORA_SECRET_KEY: 'sk_test_local_mock',
  KORA_PUBLIC_KEY: 'pk_test_local_mock',
  WA_API_BASE_URL: 'http://mock-kora:4010/_wa',
  WA_PHONE_NUMBER_ID: '000000000000000',
  WA_ACCESS_TOKEN: 'local-dummy',
  WA_APP_SECRET: 'local-dummy-app-secret',
  WA_VERIFY_TOKEN: 'local-verify',
  INNGEST_DEV: '1',
  LLM_PROVIDER: 'mock',
};

describe('parseEnv', () => {
  it('accepts the local docker values and applies defaults', () => {
    const env = parseEnv(apiSchema, localApi);
    expect(env.PORT).toBe(4000);
    expect(env.HOLD_MINUTES).toBe(15);
    expect(env.NODE_ENV).toBe('development');
  });

  it('coerces numeric strings', () => {
    expect(parseEnv(apiSchema, { ...localApi, HOLD_MINUTES: '2' }).HOLD_MINUTES).toBe(2);
  });

  it('names the bad variable but never echoes its value', () => {
    const secret = 'sk_live_supersecret';
    const run = () =>
      parseEnv(apiSchema, { ...localApi, KORA_PUBLIC_KEY: secret, DATABASE_URL: 'mysql://x' });
    expect(run).toThrow(EnvError);
    expect(run).toThrow(/KORA_PUBLIC_KEY/);
    expect(run).toThrow(/DATABASE_URL/);
    expect(run).not.toThrow(new RegExp(secret));
  });

  it('skips validation only when SKIP_ENV_VALIDATION=1', () => {
    expect(() => parseEnv(migrateSchema, {})).toThrow(EnvError);
    expect(() => parseEnv(migrateSchema, { SKIP_ENV_VALIDATION: '1' })).not.toThrow();
  });
});

describe('inngestSchema', () => {
  it('needs keys outside dev mode', () => {
    expect(inngestSchema.safeParse({}).success).toBe(false);
    expect(inngestSchema.safeParse({ INNGEST_DEV: '1' }).success).toBe(true);
    expect(
      inngestSchema.safeParse({ INNGEST_EVENT_KEY: 'e', INNGEST_SIGNING_KEY: 's' }).success,
    ).toBe(true);
  });
});

describe('llmSchema', () => {
  it('requires the matching provider key and a model', () => {
    expect(llmSchema.safeParse({ LLM_PROVIDER: 'mock' }).success).toBe(true);
    expect(llmSchema.safeParse({ LLM_PROVIDER: 'anthropic', LLM_MODEL: 'm' }).success).toBe(false);
    expect(
      llmSchema.safeParse({ LLM_PROVIDER: 'anthropic', LLM_MODEL: 'm', ANTHROPIC_API_KEY: 'k' })
        .success,
    ).toBe(true);
  });
});

describe('clientSchema', () => {
  it('only exposes NEXT_PUBLIC_ keys to the browser (I8)', () => {
    for (const key of Object.keys(clientSchema.shape)) expect(key).toMatch(/^NEXT_PUBLIC_/);
  });
});
