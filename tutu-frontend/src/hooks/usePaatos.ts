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
    onSuccess: async (response) => {
      const paivitettyPaatos = await response.json();
      queryClient.setQueryData(queryKey, paivitettyPaatos);
      // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
      await queryClient.invalidateQueries({
        queryKey: ['getHakemus', hakemusOid],
      });
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
