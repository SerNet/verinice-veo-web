import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    exclude: ['node_modules', './components/userData/__test__/**'],
    includeSource: ['**/*.{js,ts}']
  },
  // eliminate dead code in production
  define: {
    'import.meta.vitest': 'undefined'
  }
});
