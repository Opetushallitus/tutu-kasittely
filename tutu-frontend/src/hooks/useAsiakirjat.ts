'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';

import { AsiakirjaTieto } from '../lib/types/hakemus';

const getAsiakirjat = async (
  hakemusOid: string | undefined,
): Promise<AsiakirjaTieto> => {
  const url = `hakemus/${hakemusOid}/asiakirjat`;
  return await doApiFetch(url, undefined, 'no-store');
};

const putAsiakirjat = (hakemusOid: string, asiakirja: AsiakirjaTieto) => {
  const url = `hakemus/${hakemusOid}/asiakirjat`;
  return doApiPut(url, asiakirja);
};

export const useAsiakirjat = (hakemusOid: string | undefined) => {
  const queryKey = ['asiakirjat', hakemusOid];

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => getAsiakirjat(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const mutationTallenna = useMutation({
    mutationFn: (asiakirjat: AsiakirjaTieto) =>
      putAsiakirjat(hakemusOid!, asiakirjat),
    onSuccess: async (response) => {
      const paivitettyAsiakirjat = await response.json();
      queryClient.setQueryData(queryKey, paivitettyAsiakirjat);
      // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
      await queryClient.invalidateQueries({
        queryKey: ['getHakemus', hakemusOid],
      });
    },
  });

  const tallennaAsiakirjat = (asiakirjat: AsiakirjaTieto) => {
    mutationTallenna.mutate(asiakirjat);
  };

  return {
    ...query,
    tallennaAsiakirjat,
    asiakirjat: query.data,
    isLoading: query.isLoading,
    isSaving: mutationTallenna.isPending,
    isUpdateSuccess: mutationTallenna.isSuccess,
    updateError: mutationTallenna.error,
  };
};
