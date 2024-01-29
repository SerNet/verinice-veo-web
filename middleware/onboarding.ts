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

import type { IVeoDomain } from '~/composables/api/queryDefinitions/domains';
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
  const unitId = window.localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_UNIT);
  const domainId = window.localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_DOMAIN);

  // if the keys aren't present, link to /units
  if (!domainId || !unitId) {
    return navigateTo('/units');
  }

  // neither of the keys was found, so we fetch the appropriate unit
  const unit = await useQuerySync(unitQueryDefinitions.queries.fetch, {
    id: unitId,
  });
  // ... and link to the dashboard
  if (
    unit &&
    unit.domains.find((domain: IVeoDomain) =>
      domain.targetUri.includes(domainId)
    )
  ) {
    return navigateTo(`/${unit.id}/domains/${domainId}`);
  } else return navigateTo('/units');
}
