'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useShowPreview } from '@/src/context/ShowPreviewContext';
import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Paatos } from '@/src/lib/types/paatos';

const getPaatos = async (hakemusOid: string | undefined): Promise<Paatos> => {
  return await doApiFetch(`paatos/${hakemusOid}`, undefined, 'no-store');
};

const generatePaatosTeksti = async (
  hakemusOid: string | undefined,
): Promise<string> => {
  const url = `paatos/${hakemusOid}/paatosteksti/generate`;
  return await doApiFetch(url, undefined, 'no-store');
};

const putPaatos = (hakemusOid: string, paatos: Paatos) => {
  return doApiPut(`paatos/${hakemusOid}`, paatos);
};

export const usePaatos = (hakemusOid: string | undefined) => {
  const queryKey = ['paatos', hakemusOid];
  const generateQueryKey = ['paatos', 'generate', hakemusOid];
  const { showPaatosTekstiPreview } = useShowPreview();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => getPaatos(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const generatedQuery = useQuery({
    queryKey: generateQueryKey,
    queryFn: () => generatePaatosTeksti(hakemusOid),
    enabled: !!hakemusOid && showPaatosTekstiPreview,
    throwOnError: false,
    staleTime: 0, // Regenerate when previewed
  });

  const {
    mutate,
    isPending: isUpdateOngoing,
    isSuccess: isUpdateSuccess,
    error: updateError,
  } = useMutation({
    mutationFn: (paatos: Paatos) => putPaatos(hakemusOid!, paatos),
    onSuccess: async (response) => {
      const paivitettyPaatos = await response.json();
      queryClient.setQueryData(queryKey, paivitettyPaatos);
      // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
      await queryClient.invalidateQueries({
        queryKey: ['getHakemus', hakemusOid],
      });
      // Ensure generated preview is refreshed if open
      await queryClient.invalidateQueries({ queryKey: generateQueryKey });
    },
  });

  const updatePaatos = (paatos: Paatos) => {
    mutate(paatos);
  };

  return {
    ...query,
    paatosteksti: generatedQuery.data,
    isPaatosTekstiLoading:
      generatedQuery.isLoading || generatedQuery.isFetching,
    updatePaatos,
    paatos: query.data,
    isPaatosLoading: query.isLoading,
    isUpdateOngoing,
    isUpdateSuccess,
    updateError,
  };
};
