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
import { read } from '~/requests/crud';

/**
 * After a successful login users are redirected to the `/` route.
 * This middleware then redirects them to a welcome page if
 * a localStorage key `IS_FRESH_LOGIN` is absent (new user)
 * or to the dashboard if the user is recurring.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/') return;

  const isRecurringUser = localStorage.getItem(LOCAL_STORAGE_KEYS.IS_FRESH_LOGIN) === 'false';

  if (isRecurringUser) {
    return showDashBoard();
  } else {
    // Set 'IS_FRESH_LOGIN' to false to not show the welcome page a second time
    localStorage.setItem(LOCAL_STORAGE_KEYS.IS_FRESH_LOGIN, 'false');
    return navigateTo('/welcome');
  }
});

async function domainExists(id: string): Promise<boolean> {
  try {
    await read({ path: `/domains/${id}` });
    return true;
  } catch {
    return false;
  }
}

async function unitExists(id: string): Promise<boolean> {
  try {
    await read({ path: `/units/${id}` });
    return true;
  } catch {
    return false;
  }
}

const removeStorageKeys = (keys: string[]) => keys.forEach((k) => localStorage.removeItem(k));

async function showDashBoard() {
  const storageUnitId = window.localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_UNIT);
  const storageDomainId = window.localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_DOMAIN);
  const favoriteUnitId = window.localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT);
  const favoriteUnitDomain = window.localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITE_UNIT_DOMAIN);

  if (favoriteUnitId && favoriteUnitDomain) {
    if ((await unitExists(favoriteUnitId)) && (await domainExists(favoriteUnitDomain))) {
      return navigateTo(`/${favoriteUnitId}/domains/${favoriteUnitDomain}`);
    }
    removeStorageKeys([LOCAL_STORAGE_KEYS.FAVORITE_UNIT, LOCAL_STORAGE_KEYS.FAVORITE_UNIT_DOMAIN]);
    return navigateTo('/units');
  }

  // if the keys are present, link to the appropriate dashboard
  if (storageUnitId && storageDomainId) {
    if ((await unitExists(storageUnitId)) && (await domainExists(storageDomainId))) {
      return navigateTo(`/${storageUnitId}/domains/${storageDomainId}`);
    }
    removeStorageKeys([LOCAL_STORAGE_KEYS.LAST_UNIT, LOCAL_STORAGE_KEYS.LAST_DOMAIN]);
    return navigateTo('/units');
  }

  return navigateTo('/units');
}
