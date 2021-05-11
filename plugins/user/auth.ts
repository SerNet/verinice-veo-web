import Keycloak from 'keycloak-js'
import LocalStorage from '~/util/LocalStorage'

/**
 * This class handles all authentication related stuff.
 * It handles logging the user in and stores the token used for api calls.
 * It gets loaded and initialized on startup of the application.
 */
export class Auth {
  /**
   * Keycloak adapter used for communication with the keycloak server.
   */
  protected _keycloak: Keycloak.KeycloakInstance;

  /**
   * Profile of the currently logged in user (contains details such as his mail address and first and lastname)
   */
  public _profile?: Keycloak.KeycloakProfile;

  /**
   * Used to check whether the adapter has already been initialized to avoid undefined behaviour.
   */
  private _initialized: boolean;

  /**
   * Called further down upon injecting this plugin into the application.
   * @param config Contains keycloak adapter configuration set in the nuxt.config.js
   */
  constructor(config: Keycloak.KeycloakConfig) {
    this._keycloak = Keycloak(config)
    this._initialized = false
  }

  /**
   * Called in the constructor to initialize authentication. As there isn't always a need for the user to be logged in, we use 'check-sso' instead of login-required.
   * In addition the sso check is done in an iframe to prevent the user noticing the login process.
   * After the user has been logged in, we load his profile data for use in the app.
   * IMPORTANT: Many modern browsers don't allow us to check for a sso via an iframe, so we disable it (else authenticating on page load is more difficult (don't ask why))
   */
  public async init(): Promise<void> {
    await this._keycloak.init({ onLoad: 'check-sso', silentCheckSsoRedirectUri: window.location.origin + '/sso', checkLoginIframe: false }).catch((error) => {
      throw new Error(`Error while setting up authentication provider: ${error}`)
    })

    // Register hooks.
    // If the onTokenExpired event occures, the plugin tries to refresh the user's token. If it fails it tries to reauthenticate the user.
    this._keycloak.onTokenExpired = async () => {
      try {
        await this.refreshSession()
      } catch (e) {
        await this.init()
      }
    }

    if (this._keycloak.authenticated) {
      await this.loadUserProfile()
    }

    this._initialized = true
  }

  public async refreshSession() {
    await this._keycloak.updateToken(300)
  }

  /**
   * This method handles logging the user in. It redirects the user to the keycloak login page.
   *
   * @param destination If set the user gets redirected to a different page than the one he tried to login from.
   * @param absolute If set to true, the passed destination gets interpreted as an absolute url, else it gets interpreted as an absolute path within the app.
   */
  public async login(destination?: string, absolute: boolean = false): Promise<void> {
    await this._keycloak.login({ redirectUri: `${absolute ? '' : window.location.origin}${destination}` })
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
    await this._keycloak.login({ redirectUri: `${absolute ? '' : window.location.origin}${destination}`, action: 'register' })
  }

  /**
   * This method handles logging the user out.
   *
   * @param destination If set the user gets redirected to a different page than the one he logged out from.
   * @param absolute If set to true, the passed destination gets interpreted as an absolute url, else it gets interpreted as an absolute path within the app.
   */
  public async logout(destination?: string, absolute: boolean = false): Promise<void> {
    LocalStorage.clear();
    await this._keycloak.logout({ redirectUri: `${(absolute ? '' : window.location.origin)}${destination}` })
    this._keycloak.clearToken()
  }

  /**
   * Returns whether the user is authenticated or not. If the plugin hasn't been properly initialized yet, it returns false.
   */
  public get authenticated(): boolean {
    return this._keycloak.authenticated || false
  }

  /**
   * Returns whether the plugin has been fully initialized.
   */
  public get initialized(): boolean {
    return this._initialized
  }

  /**
   * Returns the token used for api communication. If the user isn't logged in, it returns undefined.
   */
  public get token(): string | undefined {
    return this._keycloak.token
  }

  public get profile(): Keycloak.KeycloakProfile | undefined {
    return this._profile
  }



  /**
   * Loads the profile of the logged in user (such as firstname, lastname and mail address). Fails if the user is not authenticated.
   */
  public async loadUserProfile() {
    try {
      const profile = await this._keycloak.loadUserProfile()
      this._profile = profile
    } catch (e) {
      throw new Error('Error while fetching user profile. User is possibly not logged in!')
    }
  }
}

