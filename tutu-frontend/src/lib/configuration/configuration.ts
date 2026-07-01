export type Configuration = {
  IS_DEV?: boolean;
  IS_PROD?: boolean;
  IS_TEST?: boolean;
  VIRKAILIJA_URL: string;
  TUTU_BACKEND: string;
  HOST?: string;
  PORT?: string;
  PUBLIC_TOLGEE_API_KEY?: string;
  PUBLIC_TOLGEE_API_URL?: string;
};

declare global {
  interface Window {
    configuration: Configuration;
  }
}

export const isDev = () => window.configuration.IS_DEV || false;
export const isProd = () => window.configuration.IS_PROD || false;
export const isTest = () => window.configuration.IS_TEST || false;

export const virkailijaUrl = () => window.configuration.VIRKAILIJA_URL;
export const raamitUrl = () =>
  `${virkailijaUrl()}/virkailija-raamit/apply-raamit.js`;
export const lokalisointiUrl = () => `${virkailijaUrl()}/lokalisointi/tolgee`;
export const tutuBackendApiUrl = () =>
  `${window.configuration.TUTU_BACKEND}/tutu-backend/api`;

export const tolgeeApiUrl = () => window.configuration.PUBLIC_TOLGEE_API_URL;
export const tolgeeApiKey = () => window.configuration.PUBLIC_TOLGEE_API_KEY;
