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
import { useQuerySync } from '~~/composables/api/utils/query';
import unitQueryDefinitions from '~~/composables/api/queryDefinitions/units';
import domainQueryDefinitions from '~~/composables/api/queryDefinitions/domains';

/**
 * Navigates the user to the domain dashboard of the unit and domain he was previously in, if he accesses the application from outside and enters the unit select page (/). The redirect
 * magic happens on that page instead of in here, as the api composable won't work here
 */
export default defineNuxtPlugin (async (nuxtApp) => {
  const router = useRouter();
  const route = useRoute();
  const { userSettings, initialize, keycloakInitialized, authenticated } = useVeoUser();

  if (!keycloakInitialized.value && route.path !== '/sso') {
    await initialize(nuxtApp);
  }

  const lastUnit = useStorage(LOCAL_STORAGE_KEYS.LAST_UNIT, undefined, localStorage, { serializer: StorageSerializers.string });
  const lastDomain = useStorage(LOCAL_STORAGE_KEYS.LAST_DOMAIN, undefined, localStorage, { serializer: StorageSerializers.string });

  // Update last unit and last domain every time the route changes
  router.afterEach((to, _from) => {
    const currentRouteUnitId = separateUUIDParam(to.params.unit as string).id;
    const currentRouteDomainId = separateUUIDParam(to.params.domain as string).id;

    if (currentRouteUnitId && lastUnit.value !== currentRouteUnitId) {
      lastUnit.value = currentRouteUnitId;
    }

    if (currentRouteDomainId && lastDomain.value !== currentRouteDomainId) {
      lastDomain.value = currentRouteDomainId;
    }
  });


  // Navigation helper (auto redirect to unit the user was previously in if he accessed the index page as entry point)
  const  _lastUnit = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_UNIT);
  const _lastDomain = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_DOMAIN);

  // localStorage.getItem only returns strings, thus we have to check the string value
  if(_lastDomain && _lastUnit && _lastDomain !== 'undefined' && _lastUnit !== 'undefined' && authenticated.value){
    const unit = await useQuerySync(unitQueryDefinitions.queries.fetch, {id:_lastUnit as string});
    const domains = await useQuerySync(domainQueryDefinitions.queries.fetchDomains, undefined);

    const data = (domains || []).filter((domain) => unit.domains.some((unitDomain) => unitDomain.targetUri.includes(domain.id)));

    if (userSettings.value.maxUnits <= 2 && data.find((domain) => domain.id === _lastDomain)) {
      navigateTo({
        name: 'unit-domains-domain',
        params: {
          unit: createUUIDUrlParam('unit', _lastUnit as string ),
          domain: createUUIDUrlParam('domain', _lastDomain)
        }
      });
    } else {
      // If the domain doesn't exist, the last unit & domain are outdated, so we remove them
      lastUnit.value = undefined;
      lastDomain.value = undefined;
    }
  }
});
