import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';

import { HakemusListItem } from '../lib/types/hakemusListItem';
import { Paginated } from '../lib/types/paginated';

const DEFAULT_SORT = 'saapumisPvm:desc';

const getHakemukset = async (): Promise<Paginated<HakemusListItem>> => {
  const localStorageSearchParams = localStorage.getItem('tutu-query-string');
  const params = new URLSearchParams(localStorageSearchParams ?? '');
  if (!params.has('sort')) {
    params.set('sort', DEFAULT_SORT);
  }
  return await doApiFetch(
    `hakemuslista?${params.toString()}`,
    undefined,
    'no-store',
  );
};

export const useHakemukset = () =>
  useQuery({
    queryKey: ['getHakemukset'],
    queryFn: getHakemukset,
    refetchOnMount: 'always',
    throwOnError: false,
  });
