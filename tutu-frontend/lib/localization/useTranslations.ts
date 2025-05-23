'use client';

import { Language, TranslatedName } from './localizationTypes';
import { useCallback } from 'react';
import { translateName } from './translationUtils';
import { TFnType, useTolgee, useTranslate } from '@tolgee/react';

export type TFunction = TFnType;

export const useTranslations = () => {
  const { getLanguage } = useTolgee(['language']);
  const { t } = useTranslate();

  const translateEntity = useCallback(
    (translateable?: TranslatedName) => {
      return translateable
        ? translateName(translateable, getLanguage() as Language)
        : '';
    },
    [getLanguage],
  );

  return { t, translateEntity, getLanguage: getLanguage as () => Language };
};
