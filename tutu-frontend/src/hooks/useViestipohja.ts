import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import useToaster from '@/src/hooks/useToaster';
import { viestipohjaListaQueryKey } from '@/src/hooks/useViestipohjat';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { doApiDelete, doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Viestipohja } from '@/src/lib/types/viesti';
import { handleSuccessMessage } from '@/src/lib/utils';

const getViestipohja = async (viestipohjaId?: string): Promise<Viestipohja> => {
  const url = `viestipohja/${viestipohjaId}`;
  return await doApiFetch(url, undefined, 'no-store');
};

const putViestipohja = async (viestipohja: Viestipohja) => {
  const url = `viestipohja`;
  return await doApiPut(url, viestipohja);
};

const deleteViestipohja = async (viestipohjaId?: string) => {
  const url = `viestipohja/${viestipohjaId}`;
  return await doApiDelete(url, undefined);
};

export const useViestipohja = (viestipohjaId?: string) => {
  const queryKey = ['viestipohja', viestipohjaId];
  const queryClient = useQueryClient();

  const { addToast } = useToaster();
  const { t } = useTranslations();

  const query = useQuery({
    queryKey,
    queryFn: () => getViestipohja(viestipohjaId),
    enabled: !!viestipohjaId,
    throwOnError: false,
  });

  const {
    mutate: updateViestipohjaMutation,
    isPending: viestipohjaUpdateOngoing,
    isSuccess: viestipohjaUpdateSuccess,
    error: viestipohjaUpdateError,
    reset: viestipohjaUpdateReset,
  } = useMutation({
    mutationFn: (viestipohja: Viestipohja) => putViestipohja(viestipohja),
    onSuccess: async (response) => {
      const paivitettyViesti = await response.json();
      queryClient.setQueryData(queryKey, paivitettyViesti);
      await queryClient.invalidateQueries({
        queryKey: viestipohjaListaQueryKey,
      });
      handleSuccessMessage(
        true,
        addToast,
        'viestipohjat.viestipohjaTallennus.success',
        t,
      );
    },
  });

  const {
    mutate: poistaViestipohjaMutation,
    isPending: poistoOngoing,
    isSuccess: poistoSuccess,
    error: poistoError,
    reset: viestipohjaPoistoReset,
  } = useMutation({
    mutationFn: () => deleteViestipohja(viestipohjaId),
  });

  const resetMutationStatuses = () => {
    viestipohjaUpdateReset();
    viestipohjaPoistoReset();
  };

  const updateViestipohja = (viestipohja: Viestipohja) => {
    resetMutationStatuses();
    updateViestipohjaMutation(viestipohja);
  };

  const poistaViestipohja = (successCallback?: () => void) => {
    resetMutationStatuses();
    poistaViestipohjaMutation(undefined, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: viestipohjaListaQueryKey,
        });
        handleSuccessMessage(
          true,
          addToast,
          'viestipohjat.viestipohjaPoisto.success',
          t,
        );
        if (successCallback) successCallback();
      },
    });
  };

  return {
    updateViestipohja: updateViestipohja,
    poistaViestipohja: poistaViestipohja,
    viestipohja: query.data,
    isViestipohjaLoading: query.isLoading,
    viestipohjaLoadingError: query.error,
    updateOngoing: viestipohjaUpdateOngoing,
    poistoOngoing,
    viestipohjaUpdateSuccess,
    viestipohjaUpdateError,
    poistoSuccess,
    poistoError,
  };
};
