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
import { waitForData } from '~/composables/helpers';
import type { TVeoDomain } from '~/composables/domains/useDomains';
import type { TVeoUnit } from '~/composables/units/useUnits';

/**
 * After a successful login users are redirected to the `/` route.
 * This middleware then redirects them to a welcome page if
 * a localStorage key `IS_FRESH_LOGIN` is absent (new user)
 * or to the dashboard if the user is recurring.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/') return;

  const { data: domains } = useDomains();
  const { data: units } = useUnits();

  const isRecurringUser = localStorage.getItem(LOCAL_STORAGE_KEYS.IS_FRESH_LOGIN) === 'false';

  if (isRecurringUser) {
    await waitForData(domains);
    await waitForData(units);
    return showDashBoard(domains.value, units.value);
  } else {
    // Set 'IS_FRESH_LOGIN' to false to not show the welcome page a second time
    localStorage.setItem(LOCAL_STORAGE_KEYS.IS_FRESH_LOGIN, 'false');
    return navigateTo('/welcome');
  }
});

function hasDomain(domains: TVeoDomain[], id: string) {
  return !!domains.find((domain) => domain.id === id);
}

function hasUnit(units: TVeoUnit[], id: string) {
  return !!units.find((unit) => unit.id === id);
}

const removeStorageKeys = (keys: string[]) => keys.forEach((k) => localStorage.removeItem(k));

function showDashBoard(domains: TVeoDomain[], units: TVeoUnit[]) {
  const storageUnitId = window.localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_UNIT);
  const storageDomainId = window.localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_DOMAIN);
  const favoriteUnitId = window.localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT);
  const favoriteUnitDomain = window.localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT_DOMAIN);

  if (favoriteUnitId && favoriteUnitDomain) {
    if (hasUnit(units, favoriteUnitId) && hasDomain(domains, favoriteUnitDomain)) {
      return navigateTo(`/${favoriteUnitId}/domains/${favoriteUnitDomain}`);
    }
    removeStorageKeys([LOCAL_STORAGE_KEYS.FAVORITE_UNIT, LOCAL_STORAGE_KEYS.FAVORITE_UNIT_DOMAIN]);
    return navigateTo('/units');
  }

  // if the keys are present, link to the appropriate dashboard
  if (storageUnitId && storageDomainId) {
    if (hasUnit(units, storageUnitId) && hasDomain(domains, storageDomainId)) {
      return navigateTo(`/${storageUnitId}/domains/${storageDomainId}`);
    }
    removeStorageKeys([LOCAL_STORAGE_KEYS.LAST_UNIT, LOCAL_STORAGE_KEYS.LAST_DOMAIN]);
    return navigateTo('/units');
  }

  return navigateTo('/units');
}
