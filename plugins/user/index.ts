import { Plugin } from '@nuxt/types';
import Keycloak from 'keycloak-js';
import { Auth } from './auth';
import LocalStorage from '~/util/LocalStorage';

/**
 * This class handles all authentication related stuff.
 * It handles logging the user in and stores the token used for api calls.
 * It gets loaded and initialized on startup of the application.
 */
export class User {
  private _auth: Auth;

  private _currentDomain?: string = undefined;

  private _currentUnit?: string = undefined;

  constructor(config: Keycloak.KeycloakConfig) {
    this._auth = new Auth(config);
  }

  public get auth(): Auth {
    return this._auth;
  }

  public get currentDomain(): string | undefined {
    const defaultDomains = LocalStorage.defaultUnitDomains as any;

    // We only need to fetch the current domain from local storage if it isn't already set, else we can just use the property in this class as it's more efficient
    if (!this._currentDomain) {
      if (this._currentUnit && Object.keys(defaultDomains).includes(this._currentUnit)) {
        return defaultDomains[this._currentUnit];
      }
    }

    return this._currentDomain;
  }

  public set currentDomain(value: string | undefined) {
    this._currentDomain = value;

    // Save the current domain to local storage
    if (this._currentDomain && this._currentUnit) {
      const defaultDomains = LocalStorage.defaultUnitDomains as any;
      defaultDomains[this._currentUnit] = this._currentDomain;
      LocalStorage.defaultUnitDomains = defaultDomains;
    }
  }

  public get unit(): string | undefined {
    return this._currentUnit;
  }

  public set unit(value: string | undefined) {
    this._currentUnit = value;
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

  inject('user', $user);
} as Plugin);
