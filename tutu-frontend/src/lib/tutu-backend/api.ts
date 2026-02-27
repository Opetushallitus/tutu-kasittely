'use client';

import { redirect } from 'next/navigation';

import { FetchError, PermissionError } from '@/src/lib/common';
import { getConfiguration } from '@/src/lib/configuration/clientConfiguration';
import { requestAuthRedirectConfirm } from '@/src/lib/navigation/authRedirect';
import { storePostLoginRedirectUrl } from '@/src/lib/navigation/postLoginRedirect';

let _csrfToken: string;
const isServer = typeof window === 'undefined';

const getTutuBackendApiUrl = () => getConfiguration().TUTU_BACKEND_API_URL;

const getLoginUrl = () => `${getTutuBackendApiUrl()}/login`;

const isUnauthenticated = (response: Response) => {
  return response?.status === 401;
};

const isCasLoginRedirect = (response: Response) => {
  try {
    const responseUrl = new URL(response.url);
    return response.redirected && responseUrl.pathname.startsWith('/cas/login');
  } catch {
    return false;
  }
};

const isAuthFailureResponse = (response: Response) => {
  return isUnauthenticated(response) || isCasLoginRedirect(response);
};

const redirectToLogin = async () => {
  if (isServer) {
    redirect(getLoginUrl());
  } else {
    const shouldRedirect = await requestAuthRedirectConfirm();
    if (!shouldRedirect) {
      return;
    }

    storePostLoginRedirectUrl();
    location.assign(getLoginUrl());
  }
};

async function csrfToken() {
  if (!_csrfToken) {
    const response = await fetch(`${getTutuBackendApiUrl()}/csrf`, {
      credentials: 'include',
    });

    const data = await response.json();
    _csrfToken = data.token;
  }

  return _csrfToken;
}

type Options = {
  headers?: Record<string, string>;
  queryParams?: string | null;
};

export async function apiFetch(
  resource: string,
  options?: Options & {
    method?: string;
    body?: string;
    headers?: { 'Content-Type'?: string };
  },
  cache?: RequestCache,
  retryWithFreshCsrf = true,
) {
  try {
    const method = options?.method ?? 'GET';
    const requiresCsrf = !['GET'].includes(method);

    const queryParams = options?.queryParams ? options.queryParams : '';
    const response = await fetch(
      `${getTutuBackendApiUrl()}/${resource}${queryParams}`,
      {
        ...options,
        method,
        credentials: 'include',
        cache: cache,
        headers: {
          ...options?.headers,
          ...(requiresCsrf
            ? {
                'X-CSRF-TOKEN': await csrfToken(),
              }
            : undefined),
          'Content-Type':
            options?.headers?.['Content-Type'] ?? 'application/json',
        },
        body: options?.body,
      },
    );

    if (isAuthFailureResponse(response)) {
      _csrfToken = '';
      await redirectToLogin();
    }

    // Retry on a csrf mismatch. Likely succeeds or causes proper redirect on auth failure
    if (response.status === 403 && retryWithFreshCsrf) {
      _csrfToken = '';
      return apiFetch(resource, options, cache, false);
    }

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

const noContent = (response: Response) => {
  return response.status === 204;
};

const responseToData = async (res: Response) => {
  if (noContent(res)) {
    return {};
  }
  try {
    const ct = res.headers.get('content-type') ?? '';
    if (ct.startsWith('text/')) {
      return await res.text();
    }

    return await res.json();
  } catch (e) {
    console.error('Parsing fetch response body as JSON failed!');
    return Promise.reject(e);
  }
};

export const doApiFetch = async (
  resource: string,
  options?: Options,
  cache?: RequestCache,
) => {
  try {
    const response = await apiFetch(resource, options, cache);
    return responseToData(response);
  } catch (error: unknown) {
    if (error instanceof FetchError) {
      if (isAuthFailureResponse(error.response)) {
        // Fetchissä (ei unsaved-confirmaatiota) odotetaan redirectia esim. 'session'
        await new Promise(() => {});
      }
      if (error.response.status === 403) {
        return Promise.reject(new PermissionError());
      }
    }
    return Promise.reject(error);
  }
};

export async function doApiPost(
  resource: string,
  body: object,
  options?: Options,
  cache?: RequestCache,
) {
  return apiFetch(
    resource,
    {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
      },
    },
    cache,
  );
}

export async function doApiPut(
  resource: string,
  body: object,
  options?: Options,
  cache?: RequestCache,
) {
  return apiFetch(
    resource,
    {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
      },
    },
    cache,
  );
}

export async function doApiPatch(
  resource: string,
  body: object,
  options?: Options,
  cache?: RequestCache,
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

export async function doApiDelete(resource: string, options?: Options) {
  return apiFetch(resource, {
    ...options,
    method: 'DELETE',
    headers: {
      ...options?.headers,
    },
  });
}
