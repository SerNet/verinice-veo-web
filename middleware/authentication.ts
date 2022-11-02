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
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';

/**
 * These routes will not trigger authentication
 */
export const publicRoutes = ['help', 'docs', 'login', 'sso'];

export const restrictedRoutes = new Map<string, [string, string]>([
  ['unit-domains-domain-editor', ['view', 'editors']],
  ['unit-domains-domain-editor-objectschema', ['view', 'editors']],
  ['unit-domains-domain-editor-formschema', ['view', 'editors']],
  ['administration', ['manage', 'accounts']]
]);

/**
 * This file is part of the middleware and checks whether the user is allowed to access a specified route.
 * It does so by using casl and gets called on every route change.
 * This functionality was formerly part of the auth plugin but as redirection via next() in the beforeEach hooks is quite buggy, it got outsourced.
 */
export default <Middleware>(async (context) => {
  const { authenticated, initialize, keycloakInitialized } = useVeoUser();
  const { ability } = useVeoPermissions();

  // Prevent the user from accessing the login page if he is logged in
  if (authenticated.value && context.route.path === '/login') {
    return context.redirect('/');
  }

  // Everything inside the if block only gets executed if the user wants to access an non-public route.
  if (!publicRoutes.some((r) => context.route.path.startsWith(`/${r}`))) {
    // If keycloak isn't initialized, initialize keycloak
    if (!keycloakInitialized.value) {
      try {
        await initialize(context);
      } catch (error: any) {
        return context.error({ statusCode: 401, message: error });
      }
    }

    // If keycloak is initialized and the user isn't logged in, redirect to login
    if (!authenticated.value) {
      return context.redirect('/login');
    }

    // check permissions
    const requiredPermission = restrictedRoutes.get(context.route.name || '');
    const isRouteRestricted = Array.isArray(requiredPermission);

    // If the route is restricted and the user doesn't have the required permissions, display an error
    if (isRouteRestricted && ability.value.cannot(requiredPermission[0], requiredPermission[1])) {
      return context.error({ statusCode: 403 });
    }
  }
});
