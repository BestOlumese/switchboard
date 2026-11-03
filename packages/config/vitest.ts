// Shared Vitest presets. `*.int.test.ts` needs Docker Postgres / mock-kora; everything else is pure.
import { defineConfig } from 'vitest/config';

export const unit = defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*.int.test.ts'],
    coverage: { provider: 'v8', include: ['src/**'] },
  },
});

export const integration = defineConfig({
  test: {
    include: ['src/**/*.int.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
