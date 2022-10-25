/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann
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
import { computed, ComputedRef, Ref, ref } from '@nuxtjs/composition-api';
import Keycloak from 'keycloak-js';
import { IBaseObject } from '~/lib/utils';

import LocalStorage from '~/util/LocalStorage';

export interface IVeoUserSettings {
  maxUnits: number | undefined;
}

export interface IVeoUserComposable {
  authenticated: Ref<boolean>;
  initialize: (context: any) => Promise<void>;
  keycloak: Ref<Keycloak | undefined>;
  keycloakInitialized: Ref<boolean>;
  login: (destination: string) => Promise<void>;
  logout: (destination: string) => Promise<void>;
  profile: ComputedRef<IBaseObject | undefined>;
  refreshKeycloakSession: () => Promise<void>;
  roles: ComputedRef<string[]>;
  tablePageSize: Ref<number>;
  token: ComputedRef<string | undefined>;
  userSettings: ComputedRef<IVeoUserSettings>;
}

const keycloak = ref<Keycloak | undefined>(undefined);
const keycloakInitializationStarted = ref(false);
const keycloakInitialized = ref(false);
const tablePageSize = ref<number>(20);

export const useUser: () => IVeoUserComposable = () => {
  const initialize = async (context: any) => {
    if (keycloakInitialized.value || keycloakInitializationStarted.value) {
      return;
    }
    keycloakInitializationStarted.value = true;
    keycloak.value = new Keycloak({
      url: context.$config.oidcUrl,
      realm: context.$config.oidcRealm,
      clientId: context.$config.oidcClient
    });

    try {
      await keycloak.value.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/sso',
        checkLoginIframe: false
      });
      if (keycloak.value.authenticated) {
        await keycloak.value.loadUserProfile();
      }
    } catch (error) {
      throw new Error(`Error while setting up authentication provider: ${error}`);
    }

    keycloak.value.onTokenExpired = async () => {
      try {
        await refreshKeycloakSession();
      } catch (e) {
        await initialize(context);
      }
    };
    keycloakInitialized.value = true;
  };

  const refreshKeycloakSession = async () => {
    if (keycloak.value) {
      await keycloak.value.updateToken(300);
    } else {
      throw new Error("Couldn't refresh session: Keycloak not initialized");
    }
  };

  /**
   * This method handles logging the user in. It redirects the user to the keycloak login page.
   *
   * @param destination If set the user gets redirected to a different page than the one he tried to login from.
   */
  const login = async (destination?: string) => {
    if (keycloak.value) {
      await keycloak.value.login({
        redirectUri: window.location.origin + destination,
        scope: 'openid'
      });
      await keycloak.value.loadUserProfile();
    } else {
      throw new Error("Couldn't login user: Keycloak not initialized");
    }
  };

  /**
   * This method handles logging the user out.
   *
   * @param destination If set the user gets redirected to a different page than the one he logged out from.
   */
  const logout = async (destination?: string) => {
    if (keycloak.value) {
      LocalStorage.clear();
      await keycloak.value.logout({
        post_logout_redirect_uri: window.location.origin + destination,
        id_token_hint: keycloak.value.idToken
      } as any); // Keycloak adpater doesn't know that the parameters changed
      keycloak.value.clearToken();
    } else {
      throw new Error("Couldn't logout user: Keycloak not initialized");
    }
  };

  const authenticated = computed<boolean>(() => keycloak.value?.authenticated || false);

  const token = computed<string | undefined>(() => keycloak.value?.token);

  const roles = computed<string[]>(() => keycloak.value?.tokenParsed?.roles || []);

  const profile = computed(() => keycloak.value?.profile);

  const userSettings = computed<IVeoUserSettings>(() => ({
    maxUnits: keycloak.value?.tokenParsed?.max_units
  }));

  return {
    authenticated,
    initialize,
    keycloak,
    keycloakInitialized,
    login,
    logout,
    profile,
    refreshKeycloakSession,
    roles,
    tablePageSize,
    token,
    userSettings
  };
};
