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

import { LOCAL_STORAGE_KEYS } from '~~/types/localStorage';
import { useQuerySync } from '~~/composables/api/utils/query';
import unitQueryDefinitions from '~~/composables/api/queryDefinitions/units';
import domainQueryDefinitions from '~~/composables/api/queryDefinitions/domains';

/**
 * Navigates the user to the domain dashboard of the unit and domain he was previously in, if he accesses the application from outside and enters the unit management page (/).
 * The redirect magic happens on that page instead of in here, as the api composable won't work here
 */
export default defineNuxtPlugin (async (nuxtApp) => {
  const route = useRoute();

  // We don't want any of this to take effect during the login process or if the print script might be running
  if (route.path === '/sso' || route.name === 'docs' && route.query.print !== undefined) {
    return;
  }

  const router = useRouter();
  const { initialize, keycloakInitialized, authenticated } = useVeoUser();

  // Update last unit and last domain every time the route changes
  const lastUnit = useStorage(LOCAL_STORAGE_KEYS.LAST_UNIT, undefined, localStorage, { serializer: StorageSerializers.string });
  const lastDomain = useStorage(LOCAL_STORAGE_KEYS.LAST_DOMAIN, undefined, localStorage, { serializer: StorageSerializers.string });

  router.afterEach((to, _from) => {
    const currentRouteUnitId = to.params.unit;
    const currentRouteDomainId = to.params.domain as string;

    if (currentRouteUnitId && lastUnit.value !== currentRouteUnitId) {
      lastUnit.value = currentRouteUnitId;
    }

    if (currentRouteDomainId && lastDomain.value !== currentRouteDomainId) {
      lastDomain.value = currentRouteDomainId;
    }
  });

  if (!keycloakInitialized.value) {
    await initialize(nuxtApp);
  }

  // The following stuff is only important if the user is logged in
  if (!authenticated.value || route.name === 'index') {
    return;
  }

  // Navigate the user to his previous unit and domain, if both still exist AND the user enters the index page
  const  _lastUnit = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_UNIT);
  const _lastDomain = localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_DOMAIN);

  const removeNavigationHelpers = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_UNIT);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.LAST_DOMAIN);
  };

  if (localStorage.getItem(LOCAL_STORAGE_KEYS.FIRST_STEPS_COMPLETED) !== 'true' && route.name !== 'docs') {
    setTimeout(() => {
      navigateTo('/welcome');
    }, 50);
  }

  // localStorage.getItem only returns strings, thus we have to check the string value
  if (_lastDomain && _lastUnit && _lastDomain !== 'undefined' && _lastUnit !== 'undefined') {
    try {
      const unit = await useQuerySync(unitQueryDefinitions.queries.fetch, {id: _lastUnit as string});
      const domains = await useQuerySync(domainQueryDefinitions.queries.fetchDomains, undefined);

      const data = (domains || []).filter((domain) => unit.domains.some((unitDomain) => unitDomain.targetUri.includes(domain.id)));

      if (data.find((domain) => domain.id === _lastDomain)) {      
        // Somehow return navigteTo, await navigateTo and nextTick(() => navigateTo) don't work, so we have to solve it dirty with a timeout.
        // 50ms seems to work reliably and isn't noticeable by the user, so we use 50ms
        setTimeout(() => {
          return navigateTo({
            name: 'unit-domains-domain',
            params: {
              unit: _lastUnit,
              domain: _lastDomain
            }
          });
        }, 50);
      } else {
        // If the domain doesn't exist, the last unit & domain are outdated, so we remove them
        removeNavigationHelpers();
      }
    } catch (_e) {
      // The error usually gets thrown by either of the unit or domain fetch, because the unit doesn't exist anymore
      removeNavigationHelpers();
    }
  }
});
