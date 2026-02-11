'use client';

import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';

import { SortOrder } from '../app/(root)/components/types';

const getYhteinenKasittely = async (
  hakemusOid: string,
  sortParam: SortOrder,
) => {
  const query = `?sort=${sortParam}`;
  return doApiFetch(
    `hakemus/${hakemusOid}/yhteinenkasittely`,
    {
      queryParams: query,
    },
    'no-store',
  );
};

export const useYhteinenKasittely = (
  hakemusOid: string | undefined,
  sortParam: SortOrder,
) => {
  return useQuery({
    queryKey: ['getYhteinenKasittely', hakemusOid, sortParam],
    queryFn: () => getYhteinenKasittely(hakemusOid as string, sortParam),
    enabled: !!hakemusOid,
    throwOnError: false,
    refetchOnMount: 'always',
  });
};
