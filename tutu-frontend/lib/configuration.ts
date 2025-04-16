export const DOMAIN =
  process.env.APP_URL ?? process.env.VIRKAILIJA_URL ?? 'https://localhost:3123';

export const isLocalhost = DOMAIN.includes('localhost');

export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export const localTranslations = process.env.LOCAL_TRANSLATIONS === 'true';

export const RAAMIT_URL = `${DOMAIN}/virkailija-raamit/apply-raamit.js`;

export const LOKALISOINTI_URL = `${DOMAIN}/virkailija-raamit`;
