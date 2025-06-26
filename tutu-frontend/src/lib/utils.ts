import { QueryClient } from '@tanstack/react-query';

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
