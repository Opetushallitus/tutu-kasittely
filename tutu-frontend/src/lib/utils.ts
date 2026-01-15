import { QueryClient } from '@tanstack/react-query';
import { FetchError } from '@/src/lib/common';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Toast } from '@/src/hooks/useToaster';
import { Tutkinto } from '@/src/lib/types/tutkinto';

export const hasTutuRole = (userRoles?: Array<string>) => {
  return userRoles?.includes('ROLE_APP_TUTU_ESITTELIJA');
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
  addToast: (toast: Toast) => void,
  error: unknown,
  baseKey: string,
  t: TFunction,
) => {
  if (error) {
    if (error instanceof FetchError) {
      addToast({
        key: baseKey,
        type: 'error',
        message: LocalizeFetchError(error, baseKey, t),
      });
    } else {
      addToast({
        key: baseKey,
        type: 'error',
        message:
          error instanceof Error ? Error.toString() : t('virhe.tuntematon'),
      });
    }
  }
};

export const LocalizeFetchError = (
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
