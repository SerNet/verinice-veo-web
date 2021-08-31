import { Plugin } from '@nuxt/types';
import Keycloak from 'keycloak-js';
import Vue from 'vue';

import { Auth } from './auth';
import LocalStorage from '~/util/LocalStorage';

/**
 * This class handles all authentication related stuff.
 * It handles logging the user in and stores the token used for api calls.
 * It gets loaded and initialized on startup of the application.
 */
export class User {
  private _auth: Auth;

  private _lastUnit: string | null = null;

  private _lastDomain: string | null = null;

  private _tablePageSize: number = 10;

  constructor(config: Keycloak.KeycloakConfig) {
    this._auth = new Auth(config);
    this._lastDomain = LocalStorage.lastDomain;
    this._lastUnit = LocalStorage.lastUnit;
  }

  public get auth(): Auth {
    return this._auth;
  }

  public updateLastDomain(newDomain: string | undefined) {
    this._lastDomain = newDomain ?? null;
    LocalStorage.lastDomain = this._lastDomain;
  }

  public updateLastUnit(newUnit: string | undefined) {
    this._lastUnit = newUnit ?? null;
    this.updateLastDomain(undefined);
    LocalStorage.lastUnit = this._lastUnit;
  }

  get lastDomain(): string | undefined {
    return this._lastDomain ?? undefined;
  }

  get lastUnit(): string | undefined {
    return this._lastUnit ?? undefined;
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
  if (route.name !== 'sso' && !$user.auth.initialized) {
    await $user.auth.init();
  }

  inject('user', Vue.observable($user));
} as Plugin);
