# Component tests

## Install

```bash
npm i --save-dev vitest @nuxt/test-utils @vue/test-utils happy-dom vite-tsconfig-paths
```

## Configure

```javascript
// ./vitest.config.mjs
import { defineVitestConfig } from '@nuxt/test-utils/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineVitestConfig({
  // use the nuxt environment by default,
  // we prefer opting in via the test file's name, see examples below
  // environment: 'nuxt',
  plugins: [tsconfigPaths()],
  test: {
    exclude: ['node_modules'],
    setupFiles: './tests/setup/mocks.ts'
  }
});
```

### optional: package.json

```json
"scripts": {
  "test": "vitest"
}
```

## Mock

## global Mocks

- global mocks go into `tests/setup/mocks`
- vitest will have to be acquainted with them `vitest.config.mjs`, see above

```javascript
import { vi } from 'vitest';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';

vi.resetModules();

// If needed, every mock can be overwritten in a spec file:
// mock it again and add/change values/fns as needed

// Mock auto-imported composables
mockNuxtImport('useUser', () => {
  return () => ({
    authenticated: true,
  });
});

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
    locale: 'de'
  });
});

// Mock part of a module, which is NOT auto-imported
vi.mock('~/some/where/myModule', async (importOriginal) => {
  const originalModule = (await importOriginal()) as object;
  return {
    ...originalModule,
    useQuery: vi.fn().mockImplementation(() => ({ data: [], isFetching: true }))
  };
});
```

## local Mocks

```javascript
// Override the global vueQuery mock in setup.ts
import * as query from '~/composables/api/utils/query';
vi.mock('~/composables/api/utils/query');
const useQueryMock = vi.mocked(query.useQuery);
useQueryMock.mockImplementation(() => ({ data: { value: ['some data'] }, isFetching: false }));

// Sometimes you might want to return different data on each function call
// e.g. if a component uses `useQuery` twice, to fetch two different server resources
useQueryMock.mockReturnValueOnce({ data: { value: ['some data '] }, isFetching: false });
useQueryMock.mockReturnValueOnce({ data: { value: ['even more data'] }, isFetching: false });
```

# Examples

- `~/tests/components/example.nuxt.spec.ts` -> start here: a very simple example test
- `~/tests/components/system-message/alert.nuxt.spec.ts` -> tests an actual veo component, shows how to override global mocks
- `~/tests/components/catalogs/defaultCatalog.nuxt.spec.ts` -> uses local mocks and fixtures
