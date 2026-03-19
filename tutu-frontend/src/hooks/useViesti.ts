'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { doApiDelete, doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
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

export type ViestiUpdateCallback = (
  viesti: Viesti,
  successCallback?: () => void,
) => void;

const putViesti = (
  hakemusOid: string,
  { viesti, vahvista }: UpdateViestiParams,
) => {
  const url = vahvista
    ? `viesti/${hakemusOid}/vahvista`
    : `viesti/${hakemusOid}`;
  return doApiPut(url, viesti);
};

export const useViesti = (hakemusOid?: string) => {
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
    isPending: viestiUpdateOngoing,
    isSuccess: viestiUpdateSuccess,
    error: viestiUpdateError,
    reset: viestiUpdateReset,
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
    reset: viestiVahvistusReset,
  } = useMutation({
    mutationFn: (viesti: Viesti) =>
      putViesti(hakemusOid!, { viesti, vahvista: true }),
  });

  const {
    mutate: poistaViestiMutation,
    isPending: poistoOngoing,
    isSuccess: poistoSuccess,
    error: poistoError,
    reset: viestiPoistoReset,
  } = useMutation({
    mutationFn: (viestiId: string) => doApiDelete(`viesti/${viestiId}`),
  });

  const resetMutationStatuses = () => {
    viestiUpdateReset();
    viestiVahvistusReset();
    viestiPoistoReset();
  };

  const updateViesti: ViestiUpdateCallback = (viesti: Viesti) => {
    resetMutationStatuses();
    updateViestiMutation(viesti);
  };

  const vahvistaViesti: ViestiUpdateCallback = (
    viesti: Viesti,
    successCallback?: () => void,
  ) => {
    resetMutationStatuses();
    vahvistaViestiMutation(viesti, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey });
        if (successCallback) successCallback();
      },
    });
  };

  const poistaViesti = (viestiId: string, successCallback?: () => void) => {
    resetMutationStatuses();
    poistaViestiMutation(viestiId, {
      onSuccess: () => {
        if (successCallback) successCallback();
      },
    });
  };

  return {
    ...query,
    updateViesti: updateViesti,
    vahvistaViesti: vahvistaViesti,
    poistaViesti: poistaViesti,
    viesti: query.data,
    isViestiLoading: query.isLoading,
    viestiLoadingError: query.error,
    updateOngoing: viestiUpdateOngoing || vahvistusOngoing,
    poistoOngoing,
    viestiUpdateSuccess,
    viestiUpdateError,
    vahvistusSuccess,
    vahvistusError,
    poistoSuccess,
    poistoError,
  };
};
