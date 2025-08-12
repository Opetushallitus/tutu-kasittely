'use client';

import { getConfiguration } from '@/src/lib/configuration/clientConfiguration';
import { FetchError, PermissionError } from '@/src/lib/common';
import { redirect } from 'next/navigation';

let _csrfToken: string;
const TUTU_BACKEND_API_URL = getConfiguration().TUTU_BACKEND_API_URL;
const loginUrl = `${TUTU_BACKEND_API_URL}/login`;
const isServer = typeof window === 'undefined';

async function csrfToken() {
  if (!_csrfToken) {
    const response = await fetch(`${TUTU_BACKEND_API_URL}/csrf`, {
      credentials: 'include',
    });
    const data = await response.json();
    _csrfToken = data.token;
  }

  return _csrfToken;
}

type Options = {
  headers?: object;
  queryParams?: string | null;
};

export async function apiFetch(
  resource: string,
  options?: Options & {
    method?: string;
    body?: string;
    headers?: { 'Content-Type'?: string };
  },
  cache?: string,
) {
  try {
    const queryParams = options?.queryParams ? options.queryParams : '';
    const response = await fetch(
      `${TUTU_BACKEND_API_URL}/${resource}${queryParams}`,
      {
        ...options,
        method: options?.method ?? 'GET',
        credentials: 'include',
        headers: {
          ...options?.headers,
          'X-CSRF-TOKEN': await csrfToken(),
          cache: cache ?? 'force-cache',
          'Content-Type':
            options?.headers?.['Content-Type'] ?? 'application/json',
        },
        body: options?.body,
      },
    );
    if (response.status >= 400) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseJson = await response.json();
        return Promise.reject(
          new FetchError(
            response,
            responseJson?.origin?.toString() || '',
            responseJson?.message?.toString() || '',
          ),
        );
      } else {
        return Promise.reject(
          new FetchError(response, '', (await response.text()) ?? ''),
        );
      }
    }
    return Promise.resolve(response);
  } catch (e) {
    console.error('Fetching data failed!');
    return Promise.reject(e);
  }
}

const isUnauthenticated = (response: Response) => {
  return response?.status === 401;
};

const isRedirected = (response: Response) => {
  return response.redirected;
};

const redirectToLogin = () => {
  if (isServer) {
    redirect(loginUrl);
  } else {
    location.assign(loginUrl);
  }
};

const noContent = (response: Response) => {
  return response.status === 204;
};

const responseToData = async (res: Response) => {
  if (noContent(res)) {
    return {};
  }
  try {
    return await res.json();
  } catch (e) {
    console.error('Parsing fetch response body as JSON failed!');
    return Promise.reject(e);
  }
};

export const doApiFetch = async (
  resource: string,
  options?: Options,
  cache?: string,
) => {
  try {
    const response = await apiFetch(resource, options, cache);
    const responseUrl = new URL(response.url);
    if (
      isRedirected(response) &&
      responseUrl.pathname.startsWith('/cas/login')
    ) {
      redirectToLogin();
    }
    return responseToData(response);
  } catch (error: unknown) {
    if (error instanceof FetchError) {
      if (isUnauthenticated(error.response)) {
        redirectToLogin();
      }
      if (error.response.status === 403) {
        return Promise.reject(new PermissionError());
      }
    }
    return Promise.reject(error);
  }
};

export async function doApiPatch(
  resource: string,
  body: object,
  options?: Options,
  cache?: string,
) {
  return apiFetch(
    resource,
    {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
      },
    },
    cache,
  );
}
