'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Perustelu } from '@/src/lib/types/perustelu';

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

export const putPerustelu = (hakemusOid: string, perustelu: Perustelu) => {
  const url = `perustelu/${hakemusOid}`;
  return doApiPut(url, perustelu);
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

  const mutationTallenna = useMutation({
    mutationFn: (perustelu: Perustelu) => putPerustelu(hakemusOid!, perustelu),
    onSuccess: async (response) => {
      const paivitettyPerustelu = await response.json();
      queryClient.setQueryData(queryKey, paivitettyPerustelu);
      // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
      queryClient.invalidateQueries({ queryKey: ['getHakemus', hakemusOid] });
    },
  });

  const tallennaPerustelu = (perustelu: Perustelu) => {
    mutationTallenna.mutate(perustelu);
  };

  return {
    ...query,
    tallennaPerustelu,
    perustelu: query.data,
    isPerusteluLoading: query.isLoading,
    isSaving: mutationTallenna.isPending,
  };
};
