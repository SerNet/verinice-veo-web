/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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

import { createUUIDUrlParam, separateUUIDParam } from '~/lib/utils';
import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

export default defineNuxtPlugin (async (nuxt) => {
  const route = useRoute();
  const router = useRouter();

  const lastUnit = useStorage(LOCAL_STORAGE_KEYS.LAST_UNIT, undefined, localStorage, { serializer: StorageSerializers.string });
  const lastDomain = useStorage(LOCAL_STORAGE_KEYS.LAST_DOMAIN, undefined, localStorage, { serializer: StorageSerializers.string });

  const clearLastVisitData = () => {
    lastUnit.value = undefined;
    lastDomain.value = undefined;
  };

  if (route.path === '/' && lastUnit.value && lastDomain.value) {
    try {
      const domains = await nuxt.$api.domain.fetchUnitDomains(lastUnit.value);
      if (domains.find((domain) => domain.id === lastDomain.value)) {
        // Without setTimeout, the user won't be navigated, even though no error is thrown. Also nextTick doesn't work, so we have to increase the timeout
        setTimeout(() => {
          navigateTo({
            name: 'unit-domains-domain',
            params: {
              unit: createUUIDUrlParam('unit', lastUnit.value),
              domain: createUUIDUrlParam('domain', lastDomain.value)
            }
          });
        }, 100);
      } else {
        // If the domain doesn't exist, the last unit & domain are outdated, so we remove them
        clearLastVisitData();
      }

      // Usually gets thrown if the unit doesn't exist. This means the last unit & domain are outdated, so we remove them
    } catch (e) {
      clearLastVisitData();
    }
  }

  // Update last unit and last domain every time the route changes
  router?.afterEach((to, _from) => {
    const currentRouteUnitId = separateUUIDParam(to.params.unit as string).id;
    const currentRouteDomainId = separateUUIDParam(to.params.domain as string).id;

    if (currentRouteUnitId && lastUnit.value !== currentRouteUnitId) {
      lastUnit.value = currentRouteUnitId;
    }

    if (currentRouteDomainId && lastDomain.value !== currentRouteDomainId) {
      lastDomain.value = currentRouteDomainId;
    }
  });
});
