import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';

import { Paginated } from '../lib/types/paginated';
import { FilemakerHakemus } from '../lib/utils/filemakerDataUtils';

export const getFilemakerHakemukset = async (): Promise<
  Paginated<FilemakerHakemus>
> => {
  const localStorageSearchParams = localStorage.getItem(
    'tutu-filemaker-query-string',
  );
  const url = localStorageSearchParams
    ? `vanha-tutu/lista?${localStorageSearchParams}`
    : 'vanha-tutu/lista';

  return await doApiFetch(url, undefined, 'no-store');
};

export const useFilemakerHakemukset = () =>
  useQuery({
    queryKey: ['getFilemakerHakemukset'],
    queryFn: getFilemakerHakemukset,
    refetchOnMount: 'always',
    throwOnError: false,
  });
