'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Paatos } from '@/src/lib/types/paatos';
import { doApiFetch, doApiPost } from '@/src/lib/tutu-backend/api';

export const getPaatos = async (
  hakemusOid: string | undefined,
): Promise<Paatos> => {
  return await doApiFetch(`paatos/${hakemusOid}`, undefined, 'no-store');
};

export const postPaatos = (hakemusOid: string, paatos: Paatos) => {
  return doApiPost(`paatos/${hakemusOid}`, paatos);
};

export const usePaatos = (hakemusOid: string | undefined) => {
  const queryKey = ['paatos', hakemusOid];

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => getPaatos(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (paatos: Paatos) => postPaatos(hakemusOid!, paatos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updatePaatos = (paatos: Paatos) => {
    mutate(paatos);
  };

  return {
    ...query,
    updatePaatos,
    paatos: query.data,
    isPaatosLoading: query.isLoading,
    updateOngoing: isPending,
  };
};
