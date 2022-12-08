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
import { reactive, useContext } from '@nuxtjs/composition-api';
import { defaultsDeep } from 'lodash';
import { useI18n } from 'nuxt-i18n-composable';
import { useVeoUser } from '~/composables/VeoUser';
import { sanitizeURLParams } from '~/lib/utils';
import { IVeoPaginationOptions } from '~/types/VeoTypes';

export enum VeoApiReponseType {
  JSON,
  BLOB,
  VOID
}

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

export const useRequest = () => {
  const context = useContext();
  const user = useVeoUser();
  const { locale } = useI18n();

  // Remove trailing slashes from each endpoint
  const apiEndpoints = reactive<Record<string, string>>({
    accounts: context.$config.accountsApiUrl.replace(/\/$/, ''),
    forms: context.$config.formsApiUrl.replace(/\/$/, ''),
    history: context.$config.historyApiUrl.replace(/\/$/, ''),
    reports: context.$config.reportsApiUrl.replace(/\/$/, ''),
    default: context.$config.apiUrl.replace(/\/$/, '')
  });

  const getUrl = (url: string) => {
    const parsedUrl = url.match(/\/api\/(\w+)\/(.*)/);
    if (!parsedUrl) {
      throw new Error("Request::getUrl: Couldn't parse request url");
    }

    let path;
    let endpoint;
    if (apiEndpoints[parsedUrl[1]]) {
      endpoint = apiEndpoints[parsedUrl[1]];
      path = parsedUrl[2];
    } else {
      endpoint = apiEndpoints.default;
      path = `${parsedUrl[1]}/${parsedUrl[2]}`;
    }

    return `${endpoint}/${path}`;
  };

  const parseResponse = async <T>(res: Response, options: RequestOptions): Promise<T & { $etag?: string }> => {
    let parsedResponseBody;

    try {
      switch (options.reponseType) {
        case VeoApiReponseType.BLOB:
          parsedResponseBody = await res.blob();
          break;
        case VeoApiReponseType.VOID:
          break;
        default:
          parsedResponseBody = await parseJson(res);
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
      if (user.keycloak.value && user.keycloak.value?.isTokenExpired()) {
        await user.refreshKeycloakSession();
        // Retry api call
        return request(res.url, options);
      }
    }
    throw new VeoApiError(res.url, res.status, parsedResponseBody?.message, parsedResponseBody);
  };

  const parseJson = async (res: Response): Promise<any> => {
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
    }
    return parsed;
  };

  const request = async <TResult = any>(url: string, options: RequestOptions): Promise<TResult> => {
    if (!user.keycloakInitialized.value) {
      await user.initialize(context);
    }

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
        Authorization: 'Bearer ' + user.keycloak.value?.token,
        'Accept-Language': locale.value
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

    const combinedOptions = defaultsDeep(options, defaults);
    combinedOptions.headers.Authorization = defaults.headers.Authorization;

    const queryParameters = new URLSearchParams(options.query || {});
    // Remove params that have an undefined value from the query parameters
    // @ts-ignore for some reason VSCode says URLSearchParams.entries() doesn't exist
    for (const [param, value] of queryParameters.entries()) {
      if (value === undefined) {
        queryParameters.delete(param);
      }
    }
    const combinedUrl = `${url}?${queryParameters.toString()}`;

    const reqURL = getUrl(combinedUrl);
    const res = await fetch(reqURL, combinedOptions);
    return await parseResponse(res, options);
  };

  return { request };
};
