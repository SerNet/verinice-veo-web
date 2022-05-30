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
import { Plugin } from '@nuxt/types';
import Keycloak from 'keycloak-js';
import Vue from 'vue';

import { Auth } from './auth';

/**
 * These routes will not trigger authentication
 */
export const publicRoutes = ['help', 'docs', 'login', 'sso'];

/**
 * This class handles all authentication related stuff.
 * It handles logging the user in and stores the token used for api calls.
 * It gets loaded and initialized on startup of the application.
 */
export class User {
  private _auth: Auth;

  private _tablePageSize: number = 20;

  constructor(config: Keycloak.KeycloakConfig) {
    this._auth = new Auth(config);
  }

  public get auth(): Auth {
    return this._auth;
  }

  public get tablePageSize(): number {
    return this._tablePageSize;
  }

  public set tablePageSize(value: number) {
    this._tablePageSize = value;
  }
}

/**
 * Default export of the plugin, injects auth in the nuxt context after initializing auth.
 */
export default (async function ({ route, $config }, inject) {
  const $user = new User({
    url: $config.oidcUrl,
    realm: $config.oidcRealm,
    clientId: $config.oidcClient
  });

  // If we init keycloak if we are on the sso page, the adapter will get confused as it tries to use the same page as the silent sso check, creating a loop.
  if (!$user.auth.initialized && (route.name === 'login' || !publicRoutes.some((r) => route.path.startsWith(`/${r}`)))) {
    await $user.auth.init();
  }

  inject('user', Vue.observable($user));
} as Plugin);
