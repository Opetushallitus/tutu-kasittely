/* eslint-disable  @typescript-eslint/no-explicit-any */

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';

export const getFilemakerHakemukset = async (): Promise<any[]> => {
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
