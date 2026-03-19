import { QueryClient } from '@tanstack/react-query';

import { AddToastCallback } from '@/src/hooks/useToaster';
import { FetchError } from '@/src/lib/common';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Tutkinto } from '@/src/lib/types/tutkinto';

export const hasTutuRole = (userRoles?: Array<string>) => {
  return userRoles?.includes('ROLE_APP_TUTU_CRUD');
};

export async function setQueryStateAndLocalStorage<T>(
  queryClient: QueryClient,
  setQueryState: (val: T) => Promise<URLSearchParams>,
  value: unknown,
) {
  const newSearchParams = await setQueryState(value as T);
  localStorage.setItem('tutu-query-string', newSearchParams.toString());
  await queryClient.invalidateQueries({ queryKey: ['getHakemukset'] });
}

export async function setFilemakerQueryStateAndLocalStorage<T>(
  queryClient: QueryClient,
  setQueryState: (val: T) => Promise<URLSearchParams>,
  value: unknown,
) {
  const newSearchParams = await setQueryState(value as T);
  localStorage.setItem(
    'tutu-filemaker-query-string',
    newSearchParams.toString(),
  );
  await queryClient.invalidateQueries({ queryKey: ['getFilemakerHakemukset'] });
}

export const setLocalStorageAndLaunchHakemusQuery = async (
  queryClient: QueryClient,
  storageKey: string,
  storageValue: string,
) => {
  localStorage.setItem(storageKey, storageValue);
  await queryClient.invalidateQueries({ queryKey: ['getHakemus'] });
};

export const handleFetchError = (
  addToast: AddToastCallback,
  error: unknown,
  baseKey: string,
  t: TFunction,
  timeMs: number = 2500,
) => {
  if (error) {
    if (error instanceof FetchError) {
      addToast({
        key: baseKey,
        type: 'error',
        message: localizeFetchError(error, baseKey, t),
        timeMs,
      });
    } else {
      addToast({
        key: baseKey,
        type: 'error',
        message:
          error instanceof Error ? error.toString() : t('virhe.tuntematon'),
        timeMs,
      });
    }
  }
};

export const localizeFetchError = (
  error: FetchError,
  baseKey: string,
  t: TFunction,
) => {
  const originTranslated =
    error.origin !== '' ? t(`virhe.${error.origin}`) : '';
  return originTranslated !== ''
    ? `${t(baseKey)} ${originTranslated}`
    : t(baseKey);
};

export const handleSuccessMessage = (
  isSuccess: boolean,
  addToast: AddToastCallback,
  translationKey: string,
  t: TFunction,
  timeMs: number = 2500,
) => {
  if (isSuccess)
    addToast({
      key: translationKey,
      type: 'success',
      message: t(translationKey),
      timeMs: timeMs,
    });
};

export const isDefined = (val: unknown) => val !== undefined && val !== null;

export { buildHakemusUpdateRequest } from '@/src/lib/utils/hakemusUpdateBuilder';

export const updateTutkintoJarjestys = (
  tutkinto: Tutkinto,
  poistettavaJarjestys: string,
) => {
  if (parseInt(tutkinto.jarjestys) > parseInt(poistettavaJarjestys)) {
    return {
      ...tutkinto,
      jarjestys: (parseInt(tutkinto.jarjestys) - 1).toString(),
    };
  } else {
    return tutkinto;
  }
};

type NullableKeys<T> = {
  [K in keyof T]: null extends T[K] ? K : never;
}[keyof T];

export const nullifyStringFieldsIfEmpty = <T>(
  obj: T,
  fields: Array<NullableKeys<T>>,
): T => {
  const result: T = { ...obj };
  fields.forEach((field) => {
    if (typeof result[field] === 'string' && result[field] === '') {
      (result[field] as string | null) = null;
    }
  });
  return result;
};

export const anyRealContentInHtml = (html: string) =>
  /[^\s<>]/.test(html.replace(/<[^>]*>/g, ''));
