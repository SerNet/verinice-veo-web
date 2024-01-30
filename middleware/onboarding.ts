/*
 * verinice.veo web
 * Copyright (C) 2023  jae, Frank Schneider
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

import { LOCAL_STORAGE_KEYS } from '~/types/localStorage';

import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { useQuerySync } from '~/composables/api/utils/query';

/**
 * After a successful login users are redirected to the `/units` route.
 * This middleware then redirects them to a welcome page if
 * a localStorage key `SHOW_WELCOME_PAGE` is either absent (new user)
 * or of the value `true`.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/') return;

  const isRecurringUser =
    localStorage.getItem(LOCAL_STORAGE_KEYS.IS_FRESH_LOGIN) === 'false';

  if (isRecurringUser) {
    return showDashBoard();
  } else {
    // Set 'IS_FRESH_LOGIN' to false to not show the welcome page a second time
    localStorage.setItem(LOCAL_STORAGE_KEYS.IS_FRESH_LOGIN, 'false');
    return navigateTo('/welcome');
  }
});

async function showDashBoard() {
  // check localStorage for unit- and domainkey
  const storageUnitId = window.localStorage.getItem(
    LOCAL_STORAGE_KEYS.LAST_UNIT
  );
  const storageDomainId = window.localStorage.getItem(
    LOCAL_STORAGE_KEYS.LAST_DOMAIN
  );

  // if the keys are present, link to the appropriate dashboard
  if (storageUnitId && storageDomainId) {
    return navigateTo(`/${storageUnitId}/domains/${storageDomainId}`);
  }
  // if neither of the keys is found fetch all units and link to the "first" unit / domain returned by the backend
  const units = await useQuerySync(unitQueryDefinitions.queries.fetchAll);

  const unitId = units?.[0]?.id;
  const domainId = units?.[0]?.domains?.[0]?.id;

  // check the IDs again; if the API call fails, link to the unit management
  const linkTarget =
    unitId && domainId ? `/${unitId}/domains/${domainId}` : '/units';

  return navigateTo(linkTarget);
}
