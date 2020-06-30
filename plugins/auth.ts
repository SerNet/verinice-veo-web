import { Plugin } from '@nuxt/types'

import Keycloak from 'keycloak-js'

export class Auth {
  protected keycloak: Keycloak.KeycloakInstance;
  public profile?: Keycloak.KeycloakProfile;

  constructor(config: Keycloak.KeycloakConfig) {
    this.keycloak = Keycloak(config)
    this.keycloak.onTokenExpired = async() => {
      try {
        const success = await this.keycloak.updateToken(3600)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('logged out')
        await this.init()
      }
    }
  }

  protected check(required: boolean = false) {
    return this.keycloak.init({ onLoad: required ? 'login-required' : 'check-sso', silentCheckSsoRedirectUri: window.location.origin + '/sso' })
  }

  async init(required: boolean = false) {
    if (await this.check(required)) {
      this.profile = await this.keycloak.loadUserProfile()
    } else if (!required) {
      await this.init(true)
    }
  }

  getToken() {
    return this.keycloak.token
  }

  logout() {
    return this.keycloak.logout()
  }
}

export default (async function({ route, env }, inject) {
  if (route.name !== 'sso') {
    const $auth = new Auth({
      url: env.VEO_OIDC_HOST,
      realm: env.VEO_OIDC_REALM,
      clientId: env.VEO_OIDC_CLIENT
    })
    await $auth.init()
    inject('auth', $auth)
  }
} as Plugin)
