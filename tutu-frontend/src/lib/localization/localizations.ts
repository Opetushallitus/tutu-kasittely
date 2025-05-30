'use client';

import { TolgeeBase } from './tolgeeConfig';
import { Language } from './localizationTypes';

const initLocalization = () => {
  return TolgeeBase().init();
};

export const tolgee = initLocalization();

export function changeLanguage(language: Language) {
  document.documentElement.lang = language;
  tolgee.changeLanguage(language);
}
