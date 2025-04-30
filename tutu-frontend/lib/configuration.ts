export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export const localTranslations = Boolean(process.env.LOCAL_TRANSLATIONS);

export const isTesting = Boolean(process.env.TEST);

export const cookieName = process.env.COOKIE_NAME ?? 'JSESSIONID';

export const APP_URL = process.env.APP_URL;

export const API_URL = process.env.API_URL;

export const LOGIN_URL = `${API_URL}/login`;

export const VIRKAILIJA_URL = process.env.VIRKAILIJA_URL;

export const RAAMIT_URL = isTesting
  ? ''
  : `${VIRKAILIJA_URL}/virkailija-raamit/apply-raamit.js`;

export const LOKALISOINTI_URL = `${VIRKAILIJA_URL}/lokalisointi/tolgee`;

export const ASIOINTIKIELI_URL = `${VIRKAILIJA_URL}/oppijanumerorekisteri-service/henkilo/current/asiointiKieli`;
