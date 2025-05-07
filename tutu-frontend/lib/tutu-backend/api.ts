import { redirect } from 'next/navigation';
import { FetchError, PermissionError } from '@/lib/common';
import { TUTU_BACKEND_API_URL } from '@/lib/configuration';

let _csrfToken: string;
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
  options?: Options,
  cache?: string,
) {
  try {
    const queryParams = options?.queryParams ? options.queryParams : '';
    const response = await fetch(
      `${TUTU_BACKEND_API_URL}/${resource}${queryParams}`,
      {
        ...options,
        credentials: 'include',
        headers: {
          ...options?.headers,
          'X-CSRF-TOKEN': await csrfToken(),
          cache: cache ?? 'force-cache',
        },
      },
    );
    return response.status >= 400
      ? Promise.reject(new FetchError(response, (await response.text()) ?? ''))
      : Promise.resolve(response);
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
  console.log('fetch user');
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
