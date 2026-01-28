'use client';

import { TFnType, useTolgee, useTranslate } from '@tolgee/react';
import { useCallback } from 'react';

import { Language, TranslatedName } from '../localizationTypes';
import { translateName } from '../translationUtils';

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
