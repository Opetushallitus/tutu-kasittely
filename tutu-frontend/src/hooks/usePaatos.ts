'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Paatos } from '@/src/lib/types/paatos';
import { doApiFetch, doApiPost } from '@/src/lib/tutu-backend/api';

export const getPaatos = async (
  hakemusOid: string | undefined,
  lomakeId: number | undefined,
): Promise<Paatos> => {
  return await doApiFetch(
    `paatos/${hakemusOid}/${lomakeId}`,
    undefined,
    'no-store',
  );
};

export const postPaatos = (
  hakemusOid: string,
  lomakeId: number,
  paatos: Paatos,
) => {
  return doApiPost(`paatos/${hakemusOid}/${lomakeId}`, paatos);
};

export const usePaatos = (
  hakemusOid: string | undefined,
  lomakeId: number | undefined,
) => {
  const queryKey = ['paatos', hakemusOid, lomakeId];

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => getPaatos(hakemusOid, lomakeId),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (paatos: Paatos) => postPaatos(hakemusOid!, lomakeId!, paatos),
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
