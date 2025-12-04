'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Paatos } from '@/src/lib/types/paatos';
import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { useShowPreview } from '@/src/context/ShowPreviewContext';

export const getPaatos = async (
  hakemusOid: string | undefined,
): Promise<Paatos> => {
  return await doApiFetch(`paatos/${hakemusOid}`, undefined, 'no-store');
};

export const getPaatosTeksti = async (
  hakemusOid: string | undefined,
): Promise<string> => {
  const url = `paatos/${hakemusOid}/paatosteksti`;
  return await doApiFetch(url, undefined, 'no-store');
};

export const putPaatos = (hakemusOid: string, paatos: Paatos) => {
  return doApiPut(`paatos/${hakemusOid}`, paatos);
};

export const usePaatos = (hakemusOid: string | undefined) => {
  const queryKey = ['paatos', hakemusOid];
  const { showPaatosTekstiPreview } = useShowPreview();

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => getPaatos(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (paatos: Paatos) => putPaatos(hakemusOid!, paatos),
    onSuccess: async (response) => {
      const paivitettyPaatos = await response.json();
      queryClient.setQueryData(queryKey, paivitettyPaatos);
      // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
      await queryClient.invalidateQueries({
        queryKey: ['getHakemus', hakemusOid],
      });
      if (showPaatosTekstiPreview) await getPaatosTeksti(hakemusOid);
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
    updateSuccess: isSuccess,
  };
};
