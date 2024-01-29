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
import Cookies from 'js-cookie';
import { defaultsDeep } from 'lodash';
import { Ref } from 'vue';

import { useVeoUser } from '~/composables/VeoUser';
import { sanitizeURLParams } from '~/lib/utils';
import { IVeoPaginationOptions } from '~/types/VeoTypes';

export enum VeoApiReponseType {
  JSON,
  BLOB,
  VOID,
}

export class VeoApiError extends Error {
  public readonly code;
  public readonly url;
  public additionalInformation: any;

  constructor(
    url: string,
    code: number,
    message: string,
    additionalInformation: any
  ) {
    super(`Error ${code} while accessing ${url}: ${message}`);

    this.url = url;
    this.code = code;
    this.message = message;
    this.additionalInformation = additionalInformation;
  }
}

export const ETAG_MAP = new Map<string, string>();

export interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | undefined> & IVeoPaginationOptions;
  params?: Record<string, string | number | undefined>;
  json?: any;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS';
  reponseType?: VeoApiReponseType;
}

export const useRequest = () => {
  const context = useNuxtApp();
  const user = useVeoUser();

  let locale: Ref<string>;
  // Get current locale, either through i18n composable or through header. Reason for try catch is use via dev plugin
  try {
    locale = useI18n().locale;
  } catch (e) {
    locale = ref(Cookies.get('i18n_redirected') || 'en');
  }

  // Remove trailing slashes from each endpoint
  const apiEndpoints = reactive<Record<string, string>>({
    accounts: context.$config.public.accountsApiUrl.replace(/\/$/, ''),
    forms: context.$config.public.formsApiUrl.replace(/\/$/, ''),
    history: context.$config.public.historyApiUrl.replace(/\/$/, ''),
    reporting: context.$config.public.reportsApiUrl.replace(/\/$/, ''),
    default: context.$config.public.apiUrl.replace(/\/$/, ''),
  });

  const getUrl = (url: string) => {
    const parsedUrl = url.match(/\/api\/([\w-]+)((\/|\?)(.*)|$)/);
    if (!parsedUrl) {
      throw new Error(`Request::getUrl: Couldn't parse request url "${url}"`);
    }

    let path;
    let endpoint;
    if (apiEndpoints[parsedUrl[1]]) {
      endpoint = apiEndpoints[parsedUrl[1]];
      path = parsedUrl[2];
    } else {
      endpoint = apiEndpoints.default;
      path = `${parsedUrl[1]}${parsedUrl[2]}`;
    }
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    return `${endpoint}/${path}`;
  };

  const parseResponse = async <T>(
    res: Response,
    options: RequestOptions
  ): Promise<T> => {
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
      console.error(
        `API Plugin::parseResponse: Error while parsing response for ${res.url}`
      );
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
    throw new VeoApiError(
      res.url,
      res.status,
      parsedResponseBody?.message,
      parsedResponseBody
    );
  };

  const parseJson = async (res: Response): Promise<any> => {
    const raw = await res.text();

    if (!raw) {
      // eslint-disable-next-line no-console
      console.warn(
        `API Plugin::parseJson: Empty response body for request ${res.url} with response type JSON`
      );
      return undefined;
    }
    const parsed = JSON.parse(raw);
    return parsed;
  };

  const updateETagMapIfEtagExists = (
    response: Response,
    options: RequestOptions
  ) => {
    const etag = response.headers.get('etag');
    if (etag && options.params?.id) {
      ETAG_MAP.set(options.params.id as string, etag);
    }
  };

  const request = async <TResult = any>(
    url: string,
    options: RequestOptions
  ): Promise<TResult> => {
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
          throw new Error(
            `API Request is missing the value for parameter "${splittedUrl[index]}"`
          );
        }
      }
    }
    url = splittedUrl.join('/');

    const defaults = {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + user.keycloak.value?.token,
        'Accept-Language': locale.value,
      } as Record<string, string>,
      method: 'GET',
      mode: 'cors',
    };

    // Some requests, but not all use an ETag header. To automate setting and getting the etag header, we assume that every query that uses an ETag has a parameter called id
    if (
      options.method !== 'GET' &&
      options.params?.id &&
      ETAG_MAP.has(options.params.id as string)
    ) {
      defaults.headers['If-Match'] = (
        ETAG_MAP.get(options.params.id as string) as string
      )
        .replace(/["]+/g, '')
        .replace(/^(.*)W\//gi, '');
    }

    if (options.json) {
      options.body = JSON.stringify(options.json);
      defaults.method = 'POST';
      defaults.headers['Content-Type'] = 'application/json';
    }

    const combinedOptions = defaultsDeep(options, defaults);
    combinedOptions.headers.Authorization = defaults.headers.Authorization;

    // Create an URLSearchParams Object after filtering out all undefined query options
    const queryParameters = new URLSearchParams(
      Object.fromEntries(
        Object.entries(options.query || {}).filter(
          ([_param, value]) => value !== undefined
        )
      )
    );

    const combinedUrl = `${url}${
      queryParameters.toString() ? '?' : ''
    }${queryParameters.toString()}`;
    const reqURL = getUrl(combinedUrl);
    const res = await fetch(reqURL, combinedOptions);
    updateETagMapIfEtagExists(res, options);
    return await parseResponse(res, options);
  };

  return { request };
};
