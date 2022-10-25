/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Markus Werner, Tino Groteloh
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
import { Middleware } from '@nuxt/types';
import { useUser } from '~/composables/VeoUser';

/**
 * These routes will not trigger authentication
 */
export const publicRoutes = ['help', 'docs', 'login', 'sso'];

/**
 * This file is part of the middleware and checks whether the user is allowed to access a specified route.
 * It does so by using casl and gets called on every route change.
 * This functionality was formerly part of the auth plugin but as redirection via next() in the beforeEach hooks is quite buggy, it got outsourced.
 */
export default <Middleware>(async (context) => {
  const { authenticated, initialize, keycloakInitialized } = useUser();

  // Proceed if the user is authenticated
  if (authenticated.value) {
    // If the user is being redirected from /login to /login, redirect to /index as he is already logged in.
    if (context.route.path === '/login' && context.from.path === '/login') {
      return context.redirect('/');
    }
  } else if (!publicRoutes.some((r) => context.route.path.startsWith(`/${r}`))) {
    if (!keycloakInitialized.value) {
      await initialize(context);
    } else {
      // User is not authenticated but needs authentication, so redirect him to the login page.
      return context.redirect('/login');
    }
  }
  return await Promise.resolve();
});
