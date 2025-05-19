export const hasTutuRole = (userRoles?: Array<string>) => {
  return userRoles?.includes('ROLE_APP_TUTU_ESITTELIJA');
};

export async function setQueryStateAndLocalStorage<T>(
  setQueryState: (val: T) => Promise<URLSearchParams>,
  value: unknown,
) {
  const newSearchParams = await setQueryState(value as T);
  localStorage.setItem('tutu-search-params', newSearchParams.toString());
}
