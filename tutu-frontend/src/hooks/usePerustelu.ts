'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Muistio } from '@/src/lib/types/muistio';
import { doApiFetch, doApiPost } from '@/src/lib/tutu-backend/api';
import { Perustelu } from '@/src/lib/types/perustelu';

export const getPerustelu = async (
  hakemusOid: string | undefined,
): Promise<Muistio> => {
  const url = `perustelu/${hakemusOid}`;
  return await doApiFetch(url, undefined, 'no-store');
};

export const postPerustelu = (hakemusOid: string, perustelu: Perustelu) => {
  const url = `perustelu/${hakemusOid}`;
  const body = {
    perustelu,
  };
  return doApiPost(url, body);
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
    mutationFn: (perustelu: Perustelu) => postPerustelu(hakemusOid!, perustelu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updatePerustelu = (perustelu: Perustelu) => {
    mutation.mutate(perustelu);
  };

  return {
    ...query,
    updatePerustelu,
    perustelu: query.data,
    isPerusteluLoading: query.isLoading,
  };
};
