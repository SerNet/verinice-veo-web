import { omit } from 'lodash';

type RequestHeaders = {
  Authorization?: string;
  'If-Match'?: string;
  'Content-Type'?: 'application/json';
  Accept?: string;
};

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: RequestHeaders;
  token?: string;
  body?: any;
};

const etags = new Map<string, string>();

async function request({
  path,
  options,
  callback
}: {
  path: string;
  options: RequestOptions;
  callback?: () => Promise<void>;
}) {
  const token = await getAuthToken();

  const opts: RequestOptions = {
    method: options.method,
    headers: getHeaders(token, options.headers ? options.headers : {}),
    ...omit(options, 'headers')
  };

  // Do we need more error handling?
  const response = await fetch(getUrl(path), opts);

  await callback?.();

  if (!response.ok) {
    throw new Error('Response was not ok:', {
      cause: await response.text()
    });
  }

  // Store etag for later use (e.g. in put)
  const etag = response.headers.get('ETag') || '';
  etags.set(path, etag);

  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    return await response.json();
  }

  return response;
}

type CrudParams = {
  path: string;
  options?: RequestOptions;
  callback?: () => Promise<void>;
};

export async function read({ path, options = {}, callback }: CrudParams) {
  if (!options.method) {
    options.method = 'GET';
  }
  return await request({ path, options, callback });
}

export async function mutate({ path, options = {}, callback }: CrudParams) {
  options = {
    method: 'PUT',
    ...options,
    headers: {
      ...options.headers,
      ['Content-Type']: 'application/json',
      ['If-Match']: etags.get(path) || ''
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  };

  return await request({ path, options, callback });
}

// Utils
async function getAuthToken() {
  const { token, refreshKeycloakSession } = useVeoUser();
  if (!token.value) {
    await refreshKeycloakSession();
  }
  return token.value || '';
}

function getUrl(path: string) {
  const config = useRuntimeConfig();

  const baseUrls = {
    veo: config.public.apiUrl,
    history: config.public.historyApiUrl,
    accounts: config.public.accountsApiUrl,
    default: config.public.apiUrl
  };

  const cleanedPath = removeLeadingSlashes(path);
  const [apiPrefix, ...rest] = cleanedPath.split('/');

  return Object.hasOwn(baseUrls, apiPrefix) ?
      removeTrailingSlashes(baseUrls[apiPrefix]) + '/' + rest.join('/')
    : removeTrailingSlashes(baseUrls['default']) + '/' + cleanedPath;
}

function getHeaders(token: string, headers: RequestHeaders = {}): RequestHeaders {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    ...headers
  };
}

function removeLeadingSlashes(str: string) {
  if (typeof str !== 'string') return str;
  return str.replace(/^[/\s]+/g, '');
}

function removeTrailingSlashes(str: string) {
  if (typeof str !== 'string') return str;
  return str.replace(/[/\s]+$/g, '');
}
