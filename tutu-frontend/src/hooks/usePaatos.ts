'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Paatos } from '@/src/lib/types/paatos';
import { doApiFetch, doApiPost, doApiPut } from '@/src/lib/tutu-backend/api';

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

/**
 * @deprecated Use putPaatos with explicit save pattern instead
 */
export const postPaatos = (
  hakemusOid: string,
  lomakeId: number,
  paatos: Paatos,
) => {
  return doApiPost(`paatos/${hakemusOid}/${lomakeId}`, paatos);
};

export const putPaatos = (
  hakemusOid: string,
  lomakeId: number,
  paatos: Paatos,
) => {
  return doApiPut(`paatos/${hakemusOid}/${lomakeId}`, paatos);
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

  /**
   * @deprecated Use tallennaPaatos with explicit save pattern instead
   */
  const updatePaatos = (paatos: Paatos) => {
    mutate(paatos);
  };

  const { mutate: mutateTallenna, isPending: isSavingTallenna } = useMutation({
    mutationFn: (paatos: Paatos) => putPaatos(hakemusOid!, lomakeId!, paatos),
    onSuccess: async (response) => {
      const paivitettyPaatos = await response.json();
      queryClient.setQueryData(queryKey, paivitettyPaatos);
    },
  });

  const tallennaPaatos = (paatos: Paatos) => {
    mutateTallenna(paatos);
  };

  return {
    ...query,
    updatePaatos,
    tallennaPaatos,
    paatos: query.data,
    isPaatosLoading: query.isLoading,
    updateOngoing: isPending,
    isSaving: isSavingTallenna,
  };
};
