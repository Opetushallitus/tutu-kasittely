'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doApiFetch, doApiPost } from '@/src/lib/tutu-backend/api';
import { Perustelu } from '@/src/lib/types/perustelu';
import { unwrapFieldWrappers } from '@/src/lib/utils/unwrapFieldWrappers';

export const getPerusteluMuistio = async (
  hakemusOid: string | undefined,
): Promise<string> => {
  const url = `perustelu/${hakemusOid}/perustelumuistio`;
  return await doApiFetch(url, undefined, 'no-store');
};

export const getPerustelu = async (
  hakemusOid: string | undefined,
): Promise<Perustelu> => {
  const url = `perustelu/${hakemusOid}`;
  return await doApiFetch(url, undefined, 'no-store');
};

export const postPerustelu = (
  hakemusOid: string,
  perustelu: Partial<Perustelu>,
) => {
  const url = `perustelu/${hakemusOid}`;
  return doApiPost(url, perustelu);
};

export const usePerustelu = (hakemusOid: string | undefined) => {
  const queryKey = ['perustelu', hakemusOid];

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => getPerustelu(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const mutation = useMutation({
    mutationFn: (perustelu: Partial<Perustelu>) =>
      postPerustelu(hakemusOid!, perustelu),
    onMutate: async (partialPerustelu) => {
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey });

      // Get current data
      const previousPerustelu = queryClient.getQueryData<Perustelu>(queryKey);

      // Optimistically update the cache
      if (previousPerustelu) {
        // Unwrap nested wrapper structures for optimistic update
        // Example: { field: { field: value } } → { field: value }
        const optimisticPerustelu = {
          ...previousPerustelu,
          ...unwrapFieldWrappers(partialPerustelu),
        };
        queryClient.setQueryData(queryKey, optimisticPerustelu as Perustelu);
      }

      // Return context with previous data for rollback
      return { previousPerustelu };
    },
    onSuccess: async (response) => {
      // Update cache with server response (source of truth)
      const paivitettyPerustelu = await response.json();
      queryClient.setQueryData(queryKey, paivitettyPerustelu);
      // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
      queryClient.invalidateQueries({ queryKey: ['getHakemus', hakemusOid] });
    },
    onError: (error, variables, context) => {
      // Rollback to previous data on error
      if (context?.previousPerustelu) {
        queryClient.setQueryData(queryKey, context.previousPerustelu);
      }
      // Invalidate to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updatePerustelu = (perustelu: Partial<Perustelu>) => {
    mutation.mutate(perustelu);
  };

  return {
    ...query,
    updatePerustelu,
    perustelu: query.data,
    isPerusteluLoading: query.isLoading,
  };
};
