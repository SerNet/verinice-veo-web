import { defineVitestConfig } from '@nuxt/test-utils/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineVitestConfig({
  plugins: [tsconfigPaths()],
  test: {
    exclude: ['node_modules', 'composables/__test__/use-units.spec.ts', './components/userData/__test__/**'],
    includeSource: ['**/*.{js,ts}'],
    setupFiles: './tests/setup/mocks.ts'
  },
  // eliminate dead code in production
  define: {
    'import.meta.vitest': 'undefined'
  }
});
