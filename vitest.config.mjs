import { defineVitestConfig } from 'nuxt-vitest/config';

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    setupFiles: ['test/setup.ts'],
  },
});
