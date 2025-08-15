import { buildConfiguration } from '@/src/lib/configuration/serverConfiguration';

export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export const isTesting = Boolean(process.env.TEST);

export const localTranslations = Boolean(process.env.LOCAL_TRANSLATIONS);

export type Configuration = Awaited<ReturnType<typeof buildConfiguration>>;
