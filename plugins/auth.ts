import { Plugin } from '@nuxt/types'
import Keycloak from 'keycloak-js'

/**
 * This class handles all authentication related stuff.
 * It handles logging the user in and stores the token used for api calls.
 * It gets loaded and initialized on startup of the application.
 */
export class Auth {
  /**
   * Keycloak adapter used for communication with the keycloak server.
   */
  protected keycloak: Keycloak.KeycloakInstance;

  /**
   * Profile of the currently logged in user (contains details such as his mail address and first and lastname)
   */
  public profile?: Keycloak.KeycloakProfile;

  /**
   * Used to check whether the adapter has already been initialized to avoid undefined behaviour.
   */
  private initialized: boolean;

  /**
   * Called further down upon injecting this plugin into the application.
   * @param config Contains keycloak adapter configuration set in the nuxt.config.js
   */
  constructor(config: Keycloak.KeycloakConfig) {
    this.keycloak = Keycloak(config)
    this.initialized = false
  }

  /**
   * Called in the constructor to initialize authentication. As there isn't always a need for the user to be logged in, we use 'check-sso' instead of login-required.
   * In addition the sso check is done in an iframe to prevent the user noticing the login process.
   * After the user has been logged in, we load his profile data for use in the app.
   * IMPORTANT: Many modern browsers don't allow us to check for a sso via an iframe, so we disable it (else authenticating on page load is more difficult (don't ask why))
   */
  public async init(): Promise<void> {
    await this.keycloak.init({ onLoad: 'check-sso', silentCheckSsoRedirectUri: window.location.origin + '/sso', checkLoginIframe: false }).catch((error) => {
      throw new Error(`Error while setting up authentication provider: ${error}`)
    })

    // Register hooks.
    // If the onTokenExpired event occures, the plugin tries to refresh the user's token. If it fails it tries to reauthenticate the user.
    this.keycloak.onTokenExpired = async() => {
      try {
        await this.keycloak.updateToken(3600)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('logged out')
        await this.init()
      }
    }

    if (this.keycloak.authenticated) {
      await this.loadUserProfile()
    }

    this.initialized = true
  }

  /**
   * This method handles logging the user in. It redirects the user to the keycloak login page.
   *
   * @param destination If set the user gets redirected to a different page than the one he tried to login from.
   * @param absolute If set to true, the passed destination gets interpreted as an absolute url, else it gets interpreted as an absolute path within the app.
   */
  public async login(destination?: string, absolute: boolean = false): Promise<void> {
    await this.keycloak.login({ redirectUri: `${absolute ? '' : window.location.origin}${destination}` })
    await this.loadUserProfile()
  }

  /**
   * This method handles registering the user by redirecting him to the keycloak register page.
   * Essentially the same method as the login method, except it passes an additional parameter.
   *
   * @param destination If set the user gets redirected to a different page than the one he tried to register from.
   * @param absolute If set to true, the passed destination gets interpreted as an absolute url, else it gets interpreted as an absolute path within the app.
   */
  public async register(destination?: string, absolute: boolean = false): Promise<void> {
    await this.keycloak.login({ redirectUri: `${absolute ? '' : window.location.origin}${destination}`, action: 'register' })
  }

  /**
   * This method handles logging the user out.
   *
   * @param destination If set the user gets redirected to a different page than the one he logged out from.
   * @param absolute If set to true, the passed destination gets interpreted as an absolute url, else it gets interpreted as an absolute path within the app.
   */
  public async logout(destination?: string, absolute: boolean = false): Promise<void> {
    await this.keycloak.logout({ redirectUri: `${absolute ? '' : window.location.origin}${destination}` })
  }

  /**
   * Returns whether the user is authenticated or not. If the plugin hasn't been properly initialized yet, it returns false.
   */
  public isAuthenticated(): boolean {
    return this.keycloak.authenticated || false
  }

  /**
   * Returns whether the plugin has been fully initialized.
   */
  public isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Returns the token used for api communication. If the user isn't logged in, it returns undefined.
   */
  public getToken(): string | undefined {
    return this.keycloak.token
  }

  /**
   * Loads the profile of the logged in user (such as firstname, lastname and mail address). Fails if the user is not authenticated.
   */
  private async loadUserProfile() {
    await this.keycloak.loadUserProfile().then((profile) => {
      this.profile = profile
    }).catch(() => {
      throw new Error('Error while fetching user profile')
    })
  }
}

/**
 * Default export of the plugin, injects auth in the nuxt context after initializing auth.
 */
export default (async function({ route, $config }, inject) {
  const $auth = new Auth({
    url: $config.oidcUrl,
    realm: $config.oidcRealm,
    clientId: $config.oidcClient
  })

  // If we init keycloak if we are on the sso page, the adapter will get confused as it tries to use the same page as the silent sso check, creating a loop.
  if (route.name !== 'sso' && !$auth.isInitialized()) {
    await $auth.init()
  }

  inject('auth', $auth)
} as Plugin)
