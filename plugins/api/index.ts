/*
 * verinice.veo web
 * Copyright (C) 2021  Philipp Ballhausen, Markus Werner, Davit Svandize, Jonas Heitmann
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
import defaultsDeep from 'lodash/defaultsDeep';
import { Plugin, Context } from '@nuxt/types';

import account from '~/plugins/api/account';
import entity from '~/plugins/api/entity';
import form from '~/plugins/api/form';
import history from '~/plugins/api/history';
import schema from '~/plugins/api/schema';
import translation from '~/plugins/api/translation';
import unit from '~/plugins/api/unit';
import report from '~/plugins/api/report';
import domain from '~/plugins/api/domain';
import monitoring from '~/plugins/api/monitoring';
import catalog from '~/plugins/api/catalog';
import { IVeoPaginationOptions } from '~/types/VeoTypes';
import { sanitizeURLParams } from '~/lib/utils';
import { IVeoUserComposable, useUser } from '~/composables/VeoUser';

export function createAPI(context: Context, user: IVeoUserComposable) {
  return Client.create(context, { account, form, entity, history, schema, translation, unit, report, domain, catalog, monitoring }, user);
}

export interface IAPIClient {
  // eslint-disable-next-line no-use-before-define
  (api: Client): Object;
}

export enum VeoApiReponseType {
  JSON,
  BLOB
}

/*
{"success":false,"resourceId":null,"message":"Cannot use risk definition 'DSRA' because the element is not a member of a scope with that risk definition"}
*/
export class VeoApiError extends Error {
  public readonly code;
  public readonly url;
  public additionalInformation: any;

  constructor(url: string, code: number, message: string, additionalInformation: any) {
    super(`Error ${code} while accessing ${url}: ${message}`);

    this.url = url;
    this.code = code;
    this.message = message;
    this.additionalInformation = additionalInformation;
  }
}

// eslint-disable-next-line no-undef
export interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | undefined> & IVeoPaginationOptions;
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
  public baseAccountURL: string;
  public _context: Context;
  public _user: IVeoUserComposable;

  static create<T extends Record<keyof T, IAPIClient>>(context: Context, namespaces: T, user: IVeoUserComposable): Client & { [K in keyof T]: ReturnType<T[K]> } {
    const instance: any = new this(context, user);
    for (const key in namespaces) {
      instance[key] = namespaces[key](instance);
    }
    return instance;
  }

  constructor(protected context: Context, user: IVeoUserComposable) {
    this.build = context.$config.build;
    this.version = context.$config.version;
    this.baseURL = `${context.$config.apiUrl}`.replace(/\/$/, '');
    this.baseFormURL = `${context.$config.formsApiUrl}`.replace(/\/$/, '');
    this.baseHistoryURL = `${context.$config.historyApiUrl}`.replace(/\/$/, '');
    this.baseReportURL = `${context.$config.reportsApiUrl}`.replace(/\/$/, '');
    this.baseAccountURL = `${context.$config.accountsApiUrl}`.replace(/\/$/, '');

    this._context = context;
    this._user = user;
  }

  public getURL(url: string) {
    const _url = String(url)
      .replace(/^\/api\/forms/, this.baseFormURL)
      .replace(/^\/api\/history/, this.baseHistoryURL)
      .replace(/^\/api\/reports/, this.baseReportURL)
      .replace(/^\/api\/accounts/, this.baseAccountURL)
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
    // Only allow alpha-numeric values and dashes in url params (NOTE: Everything behind the ? is NOT a PARAM but part of the QUERY string)
    const splittedUrl = url.split('/');
    for (const index in splittedUrl) {
      if (splittedUrl[index].startsWith(':')) {
        const replaceValue = options.params?.[splittedUrl[index].substring(1)];
        if (replaceValue) {
          splittedUrl[index] = sanitizeURLParams(String(replaceValue));
        } else {
          // eslint-disable-next-line no-console
          console.warn(`API Request is missing the value for parameter "${splittedUrl[index]}"`);
        }
      }
    }
    url = splittedUrl.join('/');

    const defaults = {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + this._user.token.value,
        'Accept-Language': this._context.i18n.locale
      } as Record<string, string>,
      method: 'GET',
      mode: 'cors'
    };

    if (options.json) {
      if ('$etag' in options.json) {
        defaults.headers['If-Match'] = options.json.$etag?.replace(/["]+/g, '').replace(/^(.*)W\//gi, '');
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
    if (options.query !== undefined) {
      for (const key in options.query) {
        const value = options.query[key];
        if (value !== undefined) {
          queryString += '&' + key + '=' + encodeURIComponent(value);
        }
      }
    }
    const combinedUrl = queryString === '' ? url : url + '?' + queryString.substr(1);

    const reqURL = this.getURL(combinedUrl);
    const res = await fetch(reqURL, combinedOptions);

    if (Number(res.status) === 401) {
      // Check whether the error was returned because of keycloak or an invalid api endpoint configuration
      try {
        if (this._user.keycloak.value) {
          await this._user.keycloak.value.loadUserProfile();
        }
      } catch (e) {
        // If the user profile couldn't get loaded, the session seems to be invalid, so we try to refresh it
        if (options.retry) {
          try {
            await this._user.refreshKeycloakSession();
            return this.req(url, { ...options, retry: false });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Couldn't refresh session");
            await this._user.initialize(this._context);
          }
        } else if (options.retry === false) {
          await this._user.initialize(this._context);
        }
      }

      return Promise.reject(new Error(`Invalid JWT: ${combinedOptions.method || 'GET'} ${reqURL}`));
    } else if (options.method === 'DELETE') {
      return Promise.resolve();
    } else {
      return await this.parseResponse(reqURL, res, options);
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
      } else {
        throw new VeoApiError(url, res.status, parsed.message, parsed);
      }
    } else {
      throw new Error('Invalid response');
    }
  }

  async parseJson(res: Response): Promise<any> {
    const raw = await res.text();
    const etag = res.headers.get('etag');

    const parsed = raw ? JSON.parse(raw) : true;
    if (typeof parsed === 'object' && etag) {
      Object.defineProperty(parsed, '$etag', { enumerable: false, configurable: false, value: etag });
    }
    return parsed;
  }
}

export default <Plugin>((context, inject) => {
  const user = useUser();

  inject('api', createAPI(context, user));
});

export type Injection = ReturnType<typeof createAPI>;

/**
 * @deprecated
 */
export type API = Injection;
