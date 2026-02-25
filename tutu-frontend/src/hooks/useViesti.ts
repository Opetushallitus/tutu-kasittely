'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Viesti } from '@/src/lib/types/viesti';

export const getViestiTyoversio = async (
  hakemusOid: string | undefined,
): Promise<Viesti> => {
  return await doApiFetch(
    `viesti/tyoversio/${hakemusOid}`,
    undefined,
    'no-store',
  );
};

export type UpdateViestiParams = {
  viesti: Viesti;
  vahvista: boolean;
};

export const putViesti = (
  hakemusOid: string,
  { viesti, vahvista }: UpdateViestiParams,
) => {
  const url = vahvista
    ? `viesti/${hakemusOid}/vahvista`
    : `viesti/${hakemusOid}`;
  return doApiPut(url, viesti);
};

export const useViesti = (hakemusOid: string | undefined) => {
  const queryKey = ['viesti', hakemusOid];

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => getViestiTyoversio(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (params: UpdateViestiParams) => putViesti(hakemusOid!, params),
    onSuccess: async (response) => {
      const paivitettyViesti = await response.json();
      queryClient.setQueryData(queryKey, paivitettyViesti);
    },
  });

  const updateViesti = (viesti: Viesti, vahvista: boolean) => {
    mutate({ viesti, vahvista });
  };

  return {
    ...query,
    updateViesti: updateViesti,
    viesti: query.data,
    isViestiLoading: query.isLoading,
    updateOngoing: isPending,
    updateSuccess: isSuccess,
  };
};
