import { omit } from 'lodash';

type RequestHeaders = {
  Authorization?: string;
  'If-Match'?: string;
  'Content-Type'?: 'application/json';
  Accept?: string;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: RequestHeaders;
  token?: string;
  body?: any;
};

const etags = new Map<string, string>();

export async function read({
  path,
  options = {},
  callback
}: {
  path: string;
  options?: RequestOptions;
  callback?: () => Promise<void>;
}) {
  const config = useRuntimeConfig();
  const url = removeTrailingSlashes(config.public.apiUrl) + '/' + removeLeadingSlashes(path);

  const { token } = useVeoUser();

  const opts: RequestOptions = {
    method: 'GET',
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

  // Store etag for later use (e.g. in update)
  const etag = response.headers.get('ETag') || '';
  etags.set(path, etag);

  return await response.json();
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
  return str.replace(/^[/\s]+/g, '');
}

function removeTrailingSlashes(str: string) {
  return str.replace(/[/\s]+$/g, '');
}
