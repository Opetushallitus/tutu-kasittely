import { isObject } from '@/src/lib/common';

import { TFunction } from './hooks/useTranslations';
import { Language, TranslatedName } from './localizationTypes';

export function translateName(
  translated: TranslatedName,
  userLanguage: Language = 'fi',
): string {
  const prop = userLanguage as keyof TranslatedName;
  const translation = translated[prop];
  if (translation && translation?.trim().length > 0) {
    return translated[prop] ?? '';
  } else if (translated.fi && translated.fi.trim().length > 0) {
    return translated.fi;
  } else if (translated.en && translated.en.trim().length > 0) {
    return translated.en;
  }
  return translated.sv ?? '';
}

export function isTranslatedName(value: unknown): value is TranslatedName {
  return (
    isObject(value) &&
    (typeof value?.fi === 'string' ||
      typeof value?.sv === 'string' ||
      typeof value?.en === 'string')
  );
}

export type TranslationNode = {
  tKey: string;
  value: string;
  children?: TranslationNode[];
};

export type TreeOption<T = string> = {
  label: T;
  value: T;
  children?: TreeOption<T>[];
};

export function buildTreeOptions(
  items: TranslationNode[],
  t: TFunction,
): TreeOption[] {
  return items.map(({ tKey, value, children }) => ({
    label: t(tKey),
    value,
    ...(children && children.length > 0
      ? { children: buildTreeOptions(children, t) }
      : {}),
  }));
}
