'use client';

import { TolgeeInstance } from '@tolgee/react';

import { Language } from './localizationTypes';
import { TolgeeBase } from './tolgeeConfig';

let _tolgee: TolgeeInstance | undefined;

// Lazy to avoid initialization before configuration is set
export function getTolgee(): TolgeeInstance {
  if (!_tolgee) {
    _tolgee = TolgeeBase().init();
  }

  return _tolgee!;
}

export function changeLanguage(language: Language) {
  document.documentElement.lang = language;
  getTolgee().changeLanguage(language);
}
