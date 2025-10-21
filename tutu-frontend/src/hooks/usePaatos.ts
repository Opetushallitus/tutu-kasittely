'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Paatos } from '@/src/lib/types/paatos';
import { doApiFetch, doApiPost } from '@/src/lib/tutu-backend/api';
import { unwrapFieldWrappers } from '@/src/lib/utils/unwrapFieldWrappers';

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
    onMutate: async (updatedPaatos) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey });

      // Get current data from cache (source of truth)
      const previousPaatos = queryClient.getQueryData<Paatos>(queryKey);

      // Optimistically update the cache
      if (previousPaatos) {
        // Unwrap nested wrapper structures for optimistic update
        // Example: { field: { field: value } } → { field: value }
        const unwrappedUpdate = unwrapFieldWrappers(updatedPaatos);

        // Special handling for paatosTiedot array: unwrap fields inside each element
        const optimisticPaatos = { ...previousPaatos };
        if (
          unwrappedUpdate.paatosTiedot &&
          Array.isArray(unwrappedUpdate.paatosTiedot)
        ) {
          optimisticPaatos.paatosTiedot = unwrappedUpdate.paatosTiedot.map(
            (paatosTieto) => unwrapFieldWrappers(paatosTieto),
          );
        }

        // Merge other top-level fields
        Object.keys(unwrappedUpdate).forEach((key) => {
          if (key !== 'paatosTiedot') {
            (optimisticPaatos as Record<string, unknown>)[key] = (
              unwrappedUpdate as Record<string, unknown>
            )[key];
          }
        });

        queryClient.setQueryData(queryKey, optimisticPaatos as Paatos);
      }

      // Return context with previous data for rollback
      return { previousPaatos };
    },
    onSuccess: async (response) => {
      // Update cache with server response (source of truth)
      const paivitettyPaatos = await response.json();
      console.log('[usePaatos] onSuccess - Server returned:', paivitettyPaatos);
      console.log(
        '[usePaatos] onSuccess - paatosTiedot[0]:',
        paivitettyPaatos.paatosTiedot?.[0],
      );
      console.log(
        '[usePaatos] onSuccess - myonteinenPaatos from server:',
        paivitettyPaatos.paatosTiedot?.[0]?.myonteinenPaatos,
      );
      queryClient.setQueryData(queryKey, paivitettyPaatos);
      // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
      queryClient.invalidateQueries({ queryKey: ['getHakemus', hakemusOid] });
    },
    onError: (error, variables, context) => {
      // Rollback to previous data on error
      if (context?.previousPaatos) {
        queryClient.setQueryData(queryKey, context.previousPaatos);
      }
      // Invalidate to refetch and ensure consistency
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
