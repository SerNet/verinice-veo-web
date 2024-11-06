import { mockNuxtImport } from '@nuxt/test-utils/runtime';

// If needed, every mock can be overwritten in a spec file:
// mock it again and add/change values/fns as needed

// Mock auto-imported composables
mockNuxtImport('useVeoUser', () => {
  return () => ({
    authenticated: true,
    initialize: () => true,
    keycloakInitialized: true,
    tablePageSize: { value: 20 }
  });
});

mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
    locale: 'de'
  });
});
