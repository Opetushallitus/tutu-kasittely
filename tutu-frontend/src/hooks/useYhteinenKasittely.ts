'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { doApiFetch, doApiPatch, doApiPost } from '@/src/lib/tutu-backend/api';

import { SortOrder } from '../app/(root)/components/types';
import { YhteinenKasittely } from '../lib/types/yhteinenkasittely';

const getYhteinenKasittely = async (
  hakemusOid: string,
  sortParam: SortOrder,
): Promise<YhteinenKasittely[]> => {
  const query = `?sort=${sortParam}`;
  return doApiFetch(
    `hakemus/${hakemusOid}/yhteinenkasittely`,
    {
      queryParams: query,
    },
    'no-store',
  );
};

export const postYhteinenKasittely = async (
  hakemusOid: string,
  kasittely: YhteinenKasittely,
): Promise<unknown> => {
  return doApiPost(`hakemus/${hakemusOid}/yhteinenkasittely`, kasittely);
};

export const patchYhteinenKasittelyVastaus = async (
  hakemusOid: string,
  payload: { id: string; vastaus?: string },
): Promise<unknown> => {
  return doApiPatch(
    `hakemus/${hakemusOid}/yhteinenkasittely/${payload.id}`,
    payload,
  );
};

export const useYhteinenKasittely = (
  hakemusOid: string,
  sortParam: SortOrder,
) => {
  const queryClient = useQueryClient();
  const queryKey = ['getYhteinenKasittely', hakemusOid, sortParam];

  const query = useQuery({
    queryKey,
    queryFn: () => getYhteinenKasittely(hakemusOid, sortParam),
    enabled: !!hakemusOid,
    throwOnError: false,
    refetchOnMount: 'always',
  });

  const createMutation = useMutation({
    mutationFn: (kasittely: YhteinenKasittely) =>
      postYhteinenKasittely(hakemusOid, kasittely),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const answerMutation = useMutation({
    mutationFn: (payload: { id: string; vastaus?: string }) =>
      patchYhteinenKasittelyVastaus(hakemusOid, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    ...query,
    kasittelyt: query.data,
    isKasittelytLoading: query.isLoading,
    luoUusiKasittely: (k: YhteinenKasittely) => createMutation.mutate(k),
    vastaaKasittelyyn: (p: { id: string; vastaus?: string }) =>
      answerMutation.mutate(p),
  };
};
