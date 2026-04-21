import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterAll, describe, expect, it } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { useVeoPermissions } from '~/composables/VeoPermissions';

const mockKeycloak = ref({ tokenParsed: createTokenParsed() });
const mockUnits = ref([{ id: 'unit-1' }]);

mockNuxtImport('useUnits', () => {
  return () => ({
    data: mockUnits
  });
});

mockNuxtImport('useVeoUser', () => {
  return () => ({
    authenticated: ref(true),
    keycloak: mockKeycloak,
    initialize: true,
    keycloakInitialized: ref(true),
    tablePageSize: ref(20)
  });
});

function createTokenParsed(roles: string[] = []) {
  return {
    realm_access: { roles },
    resource_access: { 'veo-accounts': { roles: [] } },
    unit_write_access: []
  };
}

describe('useVeoPermissions', () => {
  const scope = effectScope();
  const permissions = scope.run(() => useVeoPermissions())!;

  afterAll(() => {
    scope.stop();
  });

  it('should deny unit management without veo-write', async () => {
    // given a side user without veo-write and with free unit access
    mockKeycloak.value = {
      tokenParsed: createTokenParsed()
    };

    // when permissions are updated
    await nextTick();

    // then unrestricted unit actions are not allowed
    expect(permissions.ability.value.can('create', 'unit')).toBe(false);
    expect(permissions.ability.value.can('update', 'unit')).toBe(false);
    expect(permissions.ability.value.can('delete', 'unit')).toBe(false);
  });
});
