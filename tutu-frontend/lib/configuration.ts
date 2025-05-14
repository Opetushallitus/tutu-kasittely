export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export const localTranslations = Boolean(process.env.LOCAL_TRANSLATIONS);

export const isTesting = Boolean(process.env.TEST);

export const VIRKAILIJA_URL =
  process.env.APP_URL ?? process.env.VIRKAILIJA_URL ?? 'https://localhost:3123';

export const RAAMIT_URL = isTesting
  ? ''
  : `${VIRKAILIJA_URL}/virkailija-raamit/apply-raamit.js`;

export const LOKALISOINTI_URL = `${VIRKAILIJA_URL}/lokalisointi/tolgee`;

export const TUTU_BACKEND =
  process.env.TUTU_BACKEND ?? process.env.VIRKAILIJA_URL;

export const TUTU_BACKEND_API_URL = `${TUTU_BACKEND}/tutu-backend/api`;
