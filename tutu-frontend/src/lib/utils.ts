import { QueryClient } from '@tanstack/react-query';
import { FetchError } from '@/src/lib/common';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Toast } from '@/src/hooks/useToaster';

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
  error: Error | null,
  baseKey: string,
  t: TFunction,
) => {
  if (error instanceof FetchError) {
    addToast({
      key: baseKey,
      type: 'error',
      message: LocalizeFetchError(error, baseKey, t),
    });
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
