/*
 * verinice.veo web
 * Copyright (C) 2022  Jonas Heitmann, jae
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
import { ComputedRef, Ref } from 'vue';
import Keycloak from 'keycloak-js';
import { useVeoPermissions } from '~/composables/VeoPermissions';

export interface IVeoUserSettings {
  maxUnits: number;
  maxUsers: number;
}

export interface IVeoUserComposable {
  authenticated: Ref<boolean>;
  initialize: (context: any) => Promise<void>;
  keycloak: Ref<Keycloak | undefined>;
  keycloakInitialized: Ref<boolean>;
  login: (destination: string) => Promise<void>;
  logout: (destination: string) => Promise<void>;
  profile: ComputedRef<Record<string, any> | undefined>;
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

export const useVeoUser: () => IVeoUserComposable = () => {
  const { updatePermissions } = useVeoPermissions();

  const initialize = async (context: any) => {
    if (keycloakInitialized.value || keycloakInitializationStarted.value) {
      return;
    }
    keycloakInitializationStarted.value = true;
    keycloak.value = new Keycloak({
      url: context.$config.public.oidcUrl,
      realm: context.$config.public.oidcRealm,
      clientId: context.$config.public.oidcClient
    });

    // Refresh token HAS to be set before calling init
    keycloak.value.onTokenExpired = async () => {
      try {
        await refreshKeycloakSession();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('VeoUser::initialize_ Automatically refreshing keycloak session failed...');
        keycloakInitialized.value = false;
        keycloakInitializationStarted.value = false;
        await initialize(context);
      }
    };

    try {
      await keycloak.value.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/sso',
        checkLoginIframe: false
      });

      if (keycloak.value.authenticated) {
        await keycloak.value.loadUserProfile();
      }

      // Update permissions immediately as the middleware can't wait for the next tick
      updatePermissions([...(keycloak.value?.tokenParsed?.realm_access?.roles || []), ...(keycloak.value?.tokenParsed?.resource_access?.['veo-accounts']?.roles || [])]);
    } catch (error) {
      throw new Error(`Error while setting up authentication provider: ${JSON.stringify(error)}`);
    }

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
        redirectUri: `${window.location.origin}${destination}`,
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
  const logout = async (destination?: string, queryParameters?: Record<string, any>) => {
    if (keycloak.value) {
      if (!queryParameters) queryParameters = {};
      queryParameters.redirect_uri = false;
      await keycloak.value.logout({
        redirectUri: `${window.location.origin}${destination}?${Object.entries(queryParameters).map(([key, value]) => `${key}=${value}`).join('&')}`,
        id_token_hint: keycloak.value.idToken
      } as any); // Keycloak adpater doesn't know that the parameters changed
      keycloak.value.clearToken();
    } else {
      throw new Error("Couldn't logout user: Keycloak not initialized");
    }
  };

  const authenticated = computed<boolean>(() => keycloak.value?.authenticated || false);

  const token = computed<string | undefined>(() => keycloak.value?.token);

  const roles = computed<string[]>(() => [
    ...(keycloak.value?.tokenParsed?.realm_accessRoles || []),
    ...(keycloak.value?.tokenParsed?.resource_access?.['veo-accounts']?.roles || [])
  ]);

  const profile = computed(() => keycloak.value?.profile);

  const userSettings = computed<IVeoUserSettings>(() => ({
    maxUnits: keycloak.value?.tokenParsed?.max_units || 2,
    maxUsers: keycloak.value?.tokenParsed?.max_users || -1
  }));

  const accountDisabled = computed<boolean>(() => !keycloak.value?.tokenParsed?.groups.includes('/veo-userclass/veo-user'));

  if (authenticated.value && accountDisabled.value) {
    logout('/login', { client_disabled: true });
  }

  watch(
    () => roles.value,
    (newValue) => {
      updatePermissions(newValue);
    }
  );

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
