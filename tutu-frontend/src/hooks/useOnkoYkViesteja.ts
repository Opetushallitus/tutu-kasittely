import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';

export const getOnkoYkViesteja = async (): Promise<boolean> => {
  const localStorageSearchParams = localStorage.getItem('tutu-query-string');
  const url = localStorageSearchParams
    ? `ykViestiOnkoViesteja?${localStorageSearchParams}`
    : `ykViestiOnkoViesteja`;

  return await doApiFetch(url, undefined, 'no-store');
};

export const useOnkoYkViesteja = () =>
  useQuery({
    queryKey: ['ykViestiOnkoViesteja'],
    queryFn: getOnkoYkViesteja,
    refetchOnMount: 'always',
    throwOnError: false,
  });
