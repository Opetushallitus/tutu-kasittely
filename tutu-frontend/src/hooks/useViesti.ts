'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Viesti } from '@/src/lib/types/viesti';

const getViestiTyoversio = async (
  hakemusOid: string | undefined,
): Promise<Viesti> => {
  return await doApiFetch(
    `viesti/tyoversio/${hakemusOid}`,
    undefined,
    'no-store',
  );
};

type UpdateViestiParams = {
  viesti: Viesti;
  vahvista: boolean;
};

export type ViestiUpdateCallback = (viesti: Viesti) => void;

const putViesti = (
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

  const {
    mutate: updateViestiMutation,
    isPending: updateOngoing,
    isSuccess: viestiUpdateSuccess,
    error: viestiUpdateError,
  } = useMutation({
    mutationFn: (viesti: Viesti) =>
      putViesti(hakemusOid!, { viesti, vahvista: false }),
    onSuccess: async (response) => {
      const paivitettyViesti = await response.json();
      queryClient.setQueryData(queryKey, paivitettyViesti);
    },
  });

  const {
    mutate: vahvistaViestiMutation,
    isPending: vahvistusOngoing,
    isSuccess: vahvistusSuccess,
    error: vahvistusError,
  } = useMutation({
    mutationFn: (viesti: Viesti) =>
      putViesti(hakemusOid!, { viesti, vahvista: true }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateViesti: ViestiUpdateCallback = (viesti: Viesti) => {
    updateViestiMutation(viesti);
  };

  const vahvistaViesti: ViestiUpdateCallback = (viesti: Viesti) => {
    vahvistaViestiMutation(viesti);
  };

  return {
    ...query,
    updateViesti: updateViesti,
    vahvistaViesti: vahvistaViesti,
    viesti: query.data,
    isViestiLoading: query.isLoading,
    viestiLoadingError: query.error,
    updateOrVahvistusOngoing: updateOngoing || vahvistusOngoing,
    viestiUpdateSuccess,
    viestiUpdateError,
    vahvistusSuccess,
    vahvistusError,
  };
};
