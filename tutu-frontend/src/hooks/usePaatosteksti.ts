import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Paatosteksti } from '@/src/lib/types/paatosteksti';

const getPaatosteksti = (hakemusOid: string): Promise<Paatosteksti> => {
  const url = `paatos/${hakemusOid}/paatosteksti/`;

  return doApiFetch(url);
};

const putPaatosteksti = (hakemusOid: string, paatosteksti: Paatosteksti) => {
  const url = `paatos/${hakemusOid}/paatosteksti/${paatosteksti.id}`;

  return doApiPut(url, paatosteksti);
};

export const usePaatosteksti = (hakemusOid: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['paatosteksti', hakemusOid];

  const { data, isLoading, error } = useQuery({
    queryKey: queryKey,
    queryFn: () => getPaatosteksti(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (paatosteksti: Paatosteksti) =>
      putPaatosteksti(hakemusOid!, paatosteksti),
    onSuccess: async (response) => {
      const paivitettyPaatosteksti = await response.json();
      queryClient.setQueryData(queryKey, paivitettyPaatosteksti);
      // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
      await queryClient.invalidateQueries({
        queryKey: ['getHakemus', hakemusOid],
      });
    },
  });

  const savePaatosteksti = (paatosteksti: Paatosteksti) => {
    mutate(paatosteksti);
  };

  return {
    paatosteksti: data as Paatosteksti,
    savePaatosteksti,
    isLoading: isLoading,
    updateOngoing: isPending,
    updateSuccess: isSuccess,
    error,
  };
};
