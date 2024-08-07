/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann, jae, Frank Schneider
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { StorageSerializers, useStorage } from '@vueuse/core';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

export default defineNuxtPlugin(async (nuxtApp) => {
  const route = useRoute();
  // We don't want any of this to take effect during the login process or if the print script might be running
  if (route.path === '/sso') {
    return;
  }

  const { authenticated, initialize, keycloakInitialized } = useVeoUser();

  if (!keycloakInitialized.value) {
    await initialize(nuxtApp);
  }

  if (!authenticated.value) {
    return;
  }

  const lastUnit = useStorage(LOCAL_STORAGE_KEYS.LAST_UNIT, undefined, localStorage, {
    serializer: StorageSerializers.string
  });
  const lastDomain = useStorage(LOCAL_STORAGE_KEYS.LAST_DOMAIN, undefined, localStorage, {
    serializer: StorageSerializers.string
  });

  const router = useRouter();

  // Update last unit and last domain every time the route changes
  router.afterEach((to: any) => {
    const currentRouteUnitId = to.params.unit as string;
    const currentRouteDomainId = to.params.domain as string;

    if (currentRouteUnitId && lastUnit.value !== currentRouteUnitId) {
      lastUnit.value = currentRouteUnitId;
    }

    if (currentRouteDomainId && lastDomain.value !== currentRouteDomainId) {
      lastDomain.value = currentRouteDomainId;
    }
  });
});
