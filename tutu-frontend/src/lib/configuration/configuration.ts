export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export const isTesting = Boolean(process.env.TEST);

export const localTranslations = Boolean(process.env.LOCAL_TRANSLATIONS);

export type Configuration = {
  APP_URL: string;
  VIRKAILIJA_URL: string;
  RAAMIT_URL: string;
  LOKALISOINTI_URL: string;
  TUTU_BACKEND: string;
  TUTU_BACKEND_API_URL: string;
};
