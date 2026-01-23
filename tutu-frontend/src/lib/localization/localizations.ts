'use client';

import { Language } from './localizationTypes';
import { TolgeeBase } from './tolgeeConfig';

const initLocalization = () => {
  return TolgeeBase().init();
};

export const tolgee = initLocalization();

export function changeLanguage(language: Language) {
  document.documentElement.lang = language;
  tolgee.changeLanguage(language);
}
