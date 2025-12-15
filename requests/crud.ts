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
  const { token, refreshKeycloakSession } = useVeoUser();
  const config = useRuntimeConfig();
  const url = removeTrailingSlashes(config.public.apiUrl) + '/' + removeLeadingSlashes(path);

  if (!token.value) {
    await refreshKeycloakSession();
  }

  const opts: RequestOptions = {
    method: options.method,
    headers: generateHeaders(token.value, options.headers ? options.headers : {}),
    ...omit(options, 'headers')
  };

  // Do we need more error handling?
  const response = await fetch(url, opts);

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
      ['If-Match']: etags.get(path) || ''
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  };

  return await request({ path, options, callback });
}

// Utils
function generateHeaders(token: string, headers: RequestHeaders = {}): RequestHeaders {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
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
