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

// For test purposes
// For test purposes - ensure translations are loaded
export async function initTolgeeForTests(): Promise<void> {
  if (!_tolgee) {
    await getTolgee().run();
  }
}

export const t = ((...args: Parameters<TolgeeInstance['t']>) =>
  getTolgee().t(...args)) as TolgeeInstance['t'];

export function changeLanguage(language: Language) {
  document.documentElement.lang = language;
  getTolgee().changeLanguage(language);
}
