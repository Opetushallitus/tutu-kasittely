'use client';

import { TolgeeBase } from './tolgee-config';
import { Language } from './localization-types';

const initLocalization = () => {
  return TolgeeBase().init();
};

export const tolgee = initLocalization();

export function changeLanguage(language: Language) {
  document.documentElement.lang = language;
  tolgee.changeLanguage(language);
}
