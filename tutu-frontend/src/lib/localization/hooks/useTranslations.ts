'use client';

import { Language, TranslatedName } from '../localizationTypes';
import { useCallback } from 'react';
import { translateName } from '../translationUtils';
import { TFnType, useTolgee, useTranslate } from '@tolgee/react';

export type TFunction = TFnType;

export const useTranslations = (namespace?: string) => {
  const { getLanguage } = useTolgee(['language']);
  const { t } = useTranslate(namespace);

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
