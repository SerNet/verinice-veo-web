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

export default defineNuxtRouteMiddleware((to) => {
  if(to.path !== '/') return;

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
  // If a completely new user logs in, the SHOW_WELCOME_PAGE key is not present in localStorage:
  // set this value to show the welcome page!
  if(!Object.hasOwn(localStorage, LOCAL_STORAGE_KEYS.SHOW_WELCOME_PAGE)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SHOW_WELCOME_PAGE, 'true');
  }

  const showWelcomePage = localStorage.getItem(LOCAL_STORAGE_KEYS.SHOW_WELCOME_PAGE) === 'true';
  if(!showWelcomePage) return;

  return navigateTo('/welcome');
}

