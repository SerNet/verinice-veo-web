/*
 * verinice.veo web
 * Copyright (C) 2023  jae
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
import { SESSION_STORAGE_KEYS } from '~/types/sessionStorage';

import unitQueryDefinitions from '~/composables/api/queryDefinitions/units';
import { useQuerySync } from '~/composables/api/utils/query';

/**
 * After a successful login users are redirected to the `/` route.
 * This middleware then redirects them to a welcome page if
 * a localStorage key `SHOW_WELCOME_PAGE` is either absent (new user)
 * or of the value `true`.
 */
export default defineNuxtRouteMiddleware(() => {
  const { authenticated } = useVeoUser();
  if(!authenticated.value) return;

  // Is set to true on loging into veo (VeoUser.ts)
  const isFreshLogin = sessionStorage.getItem(SESSION_STORAGE_KEYS.IS_FRESH_LOGIN) === 'true';
  if(!isFreshLogin) return;

  // Set to false to not show welcome page a second time
  sessionStorage.setItem(SESSION_STORAGE_KEYS.IS_FRESH_LOGIN, 'false');
  return showWelcomePage();
});


async function showWelcomePage() {
  // If a new user logs in, the SHOW_WELCOME_PAGE key does not exist:
  // set this value to show the welcome page!
  if(!Object.hasOwn(localStorage, LOCAL_STORAGE_KEYS.SHOW_WELCOME_PAGE)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SHOW_WELCOME_PAGE, 'true');
  }

  const showWelcomePage = localStorage.getItem(LOCAL_STORAGE_KEYS.SHOW_WELCOME_PAGE) === 'true';
  if(!showWelcomePage) return;

  return navigateTo('/welcome');
}

const route = useRoute();

if (route.path === '/units') {
  const unitId = window.localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_UNIT);
  const domainId = window.localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_DOMAIN);

  if (unitId && domainId) {
    navigateTo(`/${unitId}/domains/${domainId}`);
  }

  const units = await useQuerySync(unitQueryDefinitions.queries.fetchAll);
  const unit = units.find((unit) => unit.id === unitId);

  if (unit && domainId && unit.domains.find((domain) => domain.targetUri.includes(domainId))) {
    navigateTo(`/${unitId}/domains/${domainId}`);
  }
}
