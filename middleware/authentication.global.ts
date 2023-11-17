/*
 * verinice.veo web
 * Copyright (C) 2023 Jonas Heitmann, Davit Svandize, Markus Werner, Tino Groteloh, Frank Schneider
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
import { useVeoPermissions } from '~/composables/VeoPermissions';
import { useVeoUser } from '~/composables/VeoUser';

/**
 * These routes will not trigger authentication
 */
export const publicRoutes = ['help', 'docs', 'login', 'security'];

export const restrictedRoutes = new Map<string, [string, string]>([
  ['unit-domains-domain-editor', ['view', 'editors']],
  ['unit-domains-domain-editor-objectschema', ['view', 'editors']],
  ['unit-domains-domain-editor-formschema', ['view', 'editors']],
  ['administration', ['view', 'accounts']]
]);

/**
 * This file is part of the middleware and checks whether the user is allowed to access a specified route.
 * It does so by using casl and gets called on every route change.
 * This functionality was formerly part of the auth plugin but as redirection via next() in the beforeEach hooks is quite buggy, it got outsourced.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const app = useNuxtApp();
  const { authenticated, initialize, keycloakInitialized } = useVeoUser();
  const { ability } = useVeoPermissions();

  // /sso only gets accessed by keycloak and keycloak can't init itself if it starts another init
  if(to.path === '/sso') {
    return;
  }

  // if the print path is called, immediately exit, as this route might has been called by the print script, which can't auth.
  if(to.name === 'docs' && to.query.print !== undefined) {
    return;
  }

  // Prevent the user from accessing the login page if he is logged in
  if (authenticated.value && to.path === '/login') {
    return navigateTo('/');
  }

  // If keycloak isn't initialized, initialize keycloak
  if (!keycloakInitialized.value) {
    try {
      await initialize(app);
    } catch (error: any) {
      throw createError({ statusCode: 401, statusMessage: error });
    }
  }

  // If keycloak is initialized, the user isn't logged in and the path isn't public, redirect to login
  if (!authenticated.value && !publicRoutes.some((r) => to.path.startsWith(`/${r}`))) {
    return navigateTo({
      path: '/login',
      query: {
        redirect_uri: to.query.redirect_uri !== 'false' ? to.fullPath : undefined
      }
    });
  }

  // check permissions
  const requiredPermission = restrictedRoutes.get(to.name?.toString() || '');
  const isRouteRestricted = Array.isArray(requiredPermission);

  // If the route is restricted and the user doesn't have the required permissions, display an error
  if (isRouteRestricted && ability.value.cannot(requiredPermission[0], requiredPermission[1])) {
    throw createError({ statusCode: 403 });
  }

  // strips the hash off the route to prevent the console warnings nuxt introduced since its update to v3.x
  if (to.hash.includes('#state')) {
    return navigateTo(to.path);
  }
});
