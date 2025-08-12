'use server';

import { Configuration, isTesting } from './configuration';

export async function buildConfiguration(): Promise<Configuration> {
  const APP_URL = process.env.APP_URL ?? 'https://localhost:3123';
  const VIRKAILIJA_URL = process.env.VIRKAILIJA_URL ?? APP_URL;
  const TUTU_BACKEND = process.env.TUTU_BACKEND ?? VIRKAILIJA_URL;

  return {
    APP_URL: process.env.APP_URL ?? 'https://localhost:3123',
    VIRKAILIJA_URL: VIRKAILIJA_URL,
    RAAMIT_URL: isTesting
      ? ''
      : `${VIRKAILIJA_URL}/virkailija-raamit/apply-raamit.js`,
    LOKALISOINTI_URL: `${VIRKAILIJA_URL}/lokalisointi/tolgee`,
    TUTU_BACKEND: TUTU_BACKEND,
    TUTU_BACKEND_API_URL: `${TUTU_BACKEND}/tutu-backend/api`,
  };
}
