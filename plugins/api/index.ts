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
import schema from '~/plugins/api/schema';
import unit from '~/plugins/api/unit';
import domain from '~/plugins/api/domain';
import monitoring from '~/plugins/api/monitoring';
import catalog from '~/plugins/api/catalog';
import { IVeoPaginationOptions } from '~/types/VeoTypes';
import { sanitizeURLParams } from '~/lib/utils';
import { IVeoUserComposable, useVeoUser } from '~/composables/VeoUser';

export function createAPI(context: Context, user: IVeoUserComposable) {
  return Client.create(context, { account, form, entity, schema, unit, domain, catalog, monitoring }, user);
}

export interface IAPIClient {
  // eslint-disable-next-line no-use-before-define
  (api: Client): Object;
}

export enum VeoApiReponseType {
  JSON,
  BLOB,
  VOID
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
      .replace(/^\/api\/reporting/, this.baseReportURL)
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
    // If for some reason keycloak isn't initialized, initialize it.
    if (!this._user.keycloakInitialized.value) {
      await this._user.initialize(this._context);
    }

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
        Authorization: 'Bearer ' + this._user.keycloak.value?.token,
        'Accept-Language': this._context.i18n.locale
      } as Record<string, string>,
      method: 'GET',
      mode: 'cors'
    };

    if (options.json) {
      if ('$etag' in options.json) {
        defaults.headers['If-Match'] = options.json.$etag?.replace(/["]+/g, '').replace(/^(.*)W\//gi, '');
      } else if ('etag' in options.json) {
        defaults.headers['If-Match'] = options.json.etag?.replace(/["]+/g, '').replace(/^(.*)W\//gi, '');
      }
      options.body = JSON.stringify(options.json);
      defaults.method = 'POST';
      defaults.headers['Content-Type'] = 'application/json';
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
    return await this.parseResponse(res, options);
  }

  async parseResponse<T>(res: Response, options: RequestOptions): Promise<T & { $etag?: string }> {
    let parsedResponseBody;

    try {
      switch (options.reponseType) {
        case VeoApiReponseType.BLOB:
          parsedResponseBody = await res.blob();
          break;
        case VeoApiReponseType.VOID:
          break;
        default:
          parsedResponseBody = await this.parseJson(res);
          break;
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(`API Plugin::parseResponse: Error while parsing response for ${res.url}`);
    }

    const status = Number(res.status);
    if (status >= 200 && status <= 300) {
      return parsedResponseBody;
    } else if (status === 401) {
      if (this._user.keycloak.value && this._user.keycloak.value?.isTokenExpired()) {
        await this._user.refreshKeycloakSession();
        // Retry api call
        return this.req(res.url, options);
      }
    }
    throw new VeoApiError(res.url, res.status, parsedResponseBody?.message, parsedResponseBody);
  }

  async parseJson(res: Response): Promise<any> {
    const raw = await res.text();
    const etag = res.headers.get('etag');

    if (!raw) {
      // eslint-disable-next-line no-console
      console.warn(`API Plugin::parseJson: Empty response body for request ${res.url} with response type JSON`);
      return undefined;
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && etag) {
      Object.defineProperty(parsed, '$etag', { enumerable: false, configurable: false, value: etag });
      parsed.etag = etag;
    }
    return parsed;
  }
}

export default <Plugin>((context, inject) => {
  const user = useVeoUser();

  inject('api', createAPI(context, user));
});

export type Injection = ReturnType<typeof createAPI>;

/**
 * @deprecated
 */
export type API = Injection;
