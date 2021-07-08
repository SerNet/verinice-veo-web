import { Middleware } from '@nuxt/types';

/**
 * This file is part of the middleware and checks whether the user is allowed to access a specified route.
 * It does so by using the $user plugins auth functionality and gets called on every route change.
 * This functionality was formerly part of the auth plugin but as redirection via next() in the beforeEach hooks is quite buggy, it got outsourced.
 */
export default (function ({ app, redirect, from, route }) {
  const publicRoutes: RegExp[] = [/^\/help\/?/, /^\/login\/?/, /^\/sso\/?/];

  // Proceed if the user is authenticated
  if (app.$user.auth.authenticated) {
    // If the user is being redirected from /login to /login, redirect to /index as he is already logged in.
    if (route.path === '/login' && from.path === '/login') {
      return redirect('/');
    }
  } else if (!publicRoutes.some((entry: RegExp) => entry.test(route.path))) {
    // User is not authenticated but needs authentication, so redirect him to the login page.
    return redirect('/login');
  }
} as Middleware);
