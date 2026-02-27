'use client';

const POST_LOGIN_REDIRECT_KEY = 'tutu-post-login-redirect';

export const storePostLoginRedirectUrl = () => {
  const url = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, url);
};

export const consumePostLoginRedirectUrl = (): string | null => {
  const url = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  if (!url || !url.startsWith('/')) {
    return null;
  }

  sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  return url;
};
