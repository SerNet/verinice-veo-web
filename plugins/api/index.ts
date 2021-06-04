import defaultsDeep from 'lodash/defaultsDeep';
import { Plugin, Context } from '@nuxt/types';

import { VeoError, VeoErrorTypes } from '~/types/VeoError';

import entity from '~/plugins/api/entity';
import form from '~/plugins/api/form';
import history from '~/plugins/api/history';
import schema from '~/plugins/api/schema';
import translation from '~/plugins/api/translation';
import unit from '~/plugins/api/unit';
import report from '~/plugins/api/report';
import { User } from '~/plugins/user';

export function createAPI(context: Context) {
  return Client.create(context, { form, entity, history, schema, translation, unit, report });
}

export interface IAPIClient {
  // eslint-disable-next-line no-use-before-define
  (api: Client): Object;
}

export enum VeoApiReponseType {
  JSON,
  BLOB
}

// eslint-disable-next-line no-undef
export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
  json?: any;
  retry?: boolean;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS';
  reponseType?: VeoApiReponseType;
}

export class Client {
  public build: string;
  public version: string;
  public baseURL: string;
  public baseFormURL: string;
  public baseHistoryURL: string;
  public baseReportURL: string;
  // public sentry: any
  public _context: Context;

  static create<T extends Record<keyof T, IAPIClient>>(context: Context, namespaces: T): Client & { [K in keyof T]: ReturnType<T[K]> } {
    const instance: any = new this(context);
    for (const key in namespaces) {
      instance[key] = namespaces[key](instance);
    }
    return instance;
  }

  constructor(protected context: Context) {
    this.build = context.$config.build;
    this.version = context.$config.version;
    this.baseURL = `${context.$config.apiUrl}`.replace(/\/$/, '');
    this.baseFormURL = `${context.$config.formsApiUrl}`.replace(/\/$/, '');
    this.baseHistoryURL = `${context.$config.historyApiUrl}`.replace(/\/$/, '');
    this.baseReportURL = `${context.$config.reportsApiUrl}`.replace(/\/$/, '') + '/reports';
    // this.sentry = context.app.$sentry
    this._context = context;
  }

  public getURL(url: string) {
    const _url = String(url)
      .replace(/^\/api\/forms/, this.baseFormURL)
      .replace(/^\/api\/history/, this.baseHistoryURL)
      .replace(/^\/api\/reports/, this.baseReportURL)
      .replace(/^\/api/, this.baseURL);
    if (_url.startsWith('/')) {
      const loc = window.location;
      return `${loc.protocol}//${loc.host}${_url}`;
    }
    return _url;
  }

  /**
   * Basic request function used by all api namespaces
   */
  public async req(url: string, options: RequestOptions = {}): Promise<any> {
    const $user = this.context.app.$user as User;

    const defaults = {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + $user.auth.token,
        'x-client-build': this.build,
        'x-client-version': this.version
      } as Record<string, string>,
      method: 'GET',
      mode: 'cors'
    };

    if (options.json) {
      if ('$etag' in options.json) {
        defaults.headers['If-Match'] = options.json.$etag?.replace(/^W\/"|"$/gi, '');
      }
      options.body = JSON.stringify(options.json);
      defaults.method = 'POST';
      defaults.headers['Content-Type'] = 'application/json';
    }

    if (options.retry === undefined) {
      options.retry = true;
    }

    const combinedOptions = defaultsDeep(options, defaults);
    combinedOptions.headers.Authorization = defaults.headers.Authorization;

    let queryString = '';
    if (options.params !== undefined) {
      for (const key in options.params) {
        const value = options.params[key];
        if (value !== undefined) {
          queryString += '&' + key + '=' + encodeURIComponent(value);
        }
      }
    }
    const combinedUrl = queryString === '' ? url : url + '?' + queryString.substr(1);
    let status = 0;
    try {
      const reqURL = this.getURL(combinedUrl);
      const res = await fetch(reqURL, combinedOptions);
      status = res.status;
      if (Number(res.status) === 401) {
        // Check whether the error was returned because of keycloak or an invalid api endpoint configuration
        try {
          await $user.auth.loadUserProfile();
        } catch (e) {
          // If the user profile couldn't get loaded, the session seems to be invalid, so we try to refresh it
          if (options.retry) {
            try {
              await $user.auth.refreshSession();
              return this.req(url, { ...options, retry: false });
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error("Couldn't refresh session");
              await $user.auth.logout('/');
            }
          } else if (options.retry === false) {
            await $user.auth.logout('/');
          }
        }

        return Promise.reject(new Error(`Invalid JWT: ${combinedOptions.method || 'GET'} ${reqURL}`));
      } else if (options.method === 'DELETE') {
        return Promise.resolve();
      } else {
        return await this.parseResponse(reqURL, res, options);
      }
    } catch (e) {
      // this.sentry.setTag('error_level', 'warning')
      // this.sentry.captureException(e)
      return Promise.reject(Object.assign(e, { status }));
    }
  }

  async parseResponse<T>(url: string, res: Response, options: RequestOptions): Promise<T & { $etag?: string }> {
    let parsed;

    switch (options.reponseType) {
      case VeoApiReponseType.BLOB:
        parsed = await res.blob();
        break;
      default:
        parsed = await this.parseJson(res);
        break;
    }

    if (parsed) {
      if (res.status >= 200 && res.status <= 300) {
        return parsed;
      } else if (parsed.code) {
        throw new VeoError(parsed.code, VeoErrorTypes.VEO_ERROR_COMMON);
      } else {
        const e = new Error(`Error ${res.status || '?'} while accessing ${url}: ${parsed.name}`);
        e.name = 'API_EXCEPTION';
        throw e;
      }
    } else {
      throw new VeoError('Invalid response');
    }
  }

  async parseJson(res: Response): Promise<any> {
    const raw = await res.text();
    const etag = res.headers.get('etag');

    let parsed;
    try {
      parsed = raw ? JSON.parse(raw) : true;
      if (typeof parsed === 'object' && etag) {
        Object.defineProperty(parsed, '$etag', { enumerable: false, configurable: false, value: etag });
      }
      return parsed;
    } catch (e) {
      throw new VeoError('Non JSON response');
    }
  }
}

export default (function (context, inject) {
  inject('api', createAPI(context));
} as Plugin);

export type Injection = ReturnType<typeof createAPI>;
export type API = Injection;
