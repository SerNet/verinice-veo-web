import { Plugin } from '@nuxt/types'
import { Route } from 'vue-router'
import Keycloak from 'keycloak-js'

export class Auth {
  protected keycloak: Keycloak.KeycloakInstance;
  public profile?: Keycloak.KeycloakProfile;

  constructor(config: Keycloak.KeycloakConfig) {
    this.keycloak = Keycloak(config)
    this.keycloak.onTokenExpired = async() => {
      try {
        await this.keycloak.updateToken(3600)
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
    try {
      return this.keycloak.logout()
    } catch (e) {

    }
  }
}

export default (async function({ route, $config, app }, inject) {
  const $auth = new Auth({
    url: $config.oidcUrl,
    realm: $config.oidcRealm,
    clientId: $config.oidcClient
  })

  async function checkRoute(r: Route) {
    const excluded = [/^\/help\/?/, /^\/login\/?/]
    if (r.name !== 'sso') {
      if (!excluded.some((entry: RegExp) => entry.test(r.path))) {
        await $auth.init()
      }
    }
  }

  app.router?.beforeEach(async(to, from, next) => {
    try {
      if (!$auth.profile) {
        await checkRoute(to)
      }
    } finally {
      next()
    }
  })

  console.log('CHECK ROUTE')
  await checkRoute(route)

  inject('auth', $auth)
} as Plugin)
