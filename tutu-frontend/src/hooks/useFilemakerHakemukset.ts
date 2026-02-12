import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';

import { FilemakerHakemus } from '../lib/utils/filemakerDataUtils';

type FilemakerHakemuksetListResult = {
  count: number;
  items: FilemakerHakemus[];
};

export const getFilemakerHakemukset =
  async (): Promise<FilemakerHakemuksetListResult> => {
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
