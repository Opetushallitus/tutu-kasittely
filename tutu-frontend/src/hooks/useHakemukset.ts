import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { HakemusListItem } from '@/src/lib/types/hakemusListItem';

export const getHakemukset = async (): Promise<HakemusListItem[]> => {
  const localStorageSearchParams = localStorage.getItem('tutu-query-string');
  const url = localStorageSearchParams
    ? `hakemuslista?${localStorageSearchParams}`
    : 'hakemuslista?sort=saapumisPvm:desc';

  return await doApiFetch(url, undefined, 'no-store');
};

export const useHakemukset = () =>
  useQuery({
    queryKey: ['getHakemukset'],
    queryFn: getHakemukset,
    refetchOnMount: 'always',
    throwOnError: false,
  });
