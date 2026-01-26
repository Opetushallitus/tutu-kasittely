'use client';

import { TolgeeInstance } from '@tolgee/react';

import { Language } from './localizationTypes';
import { TolgeeBase } from './tolgeeConfig';

declare global {
  interface Window {
    _tolgee: TolgeeInstance;
  }
}

// Lazy to avoid initialization before configuration is set
export function getTolgee(): TolgeeInstance {
  if (!window._tolgee) {
    window._tolgee = TolgeeBase().init();
  }

  return window._tolgee;
}

export function changeLanguage(language: Language) {
  document.documentElement.lang = language;
  getTolgee().changeLanguage(language);
}
