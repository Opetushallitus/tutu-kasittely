export const DOMAIN =
  process.env.APP_URL ?? process.env.VIRKAILIJA_URL ?? 'https://localhost:3123';

export const isLocalhost = DOMAIN.includes('localhost');

export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export const localTranslations = process.env.LOCAL_TRANSLATIONS === 'true';

export const RAAMIT_URL = `${DOMAIN}/virkailija-raamit/apply-raamit.js`;

export const LOKALISOINTI_URL = `${isLocalhost ? 'https://virkailija.testiopintopolku.fi' : DOMAIN}/lokalisointi/tolgee`;

export const API_URL = `${isLocalhost ? 'https://localhost:8443' : DOMAIN}/tutu-backend/api`;

export const LOGIN_URL = `${API_URL}/login`;

export const ASIOINTIKIELI_URL = `${DOMAIN}/oppijanumerorekisteri-service/henkilo/current/asiointiKieli`;

export const cookieName = process.env.COOKIE_NAME ?? 'JSESSIONID';
