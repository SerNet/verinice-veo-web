/*
 * verinice.veo web
 * Copyright (C) 2021  Jonas Heitmann, Davit Svandize, Markus Werner
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
import { publicRoutes } from '~/plugins/user/index';
/**
 * This file is part of the middleware and checks whether the user is allowed to access a specified route.
 * It does so by using the $user plugins auth functionality and gets called on every route change.
 * This functionality was formerly part of the auth plugin but as redirection via next() in the beforeEach hooks is quite buggy, it got outsourced.
 */
export default (function ({ app, redirect, from, route }) {
  // Proceed if the user is authenticated
  if (app.$user.auth.authenticated) {
    // If the user is being redirected from /login to /login, redirect to /index as he is already logged in.
    if (route.path === '/login' && from.path === '/login') {
      return redirect('/');
    }
  } else if (!publicRoutes.some((r) => route.path.startsWith(`/${r}`))) {
    // User is not authenticated but needs authentication, so redirect him to the login page.
    return redirect('/login');
  }
} as Middleware);
