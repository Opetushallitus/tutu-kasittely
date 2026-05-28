import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { paatospohjaListaQueryKey } from '@/src/hooks/usePaatospohjat';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { doApiDelete, doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Paatospohja } from '@/src/lib/types/paatosteksti';
import { handleSuccessMessage } from '@/src/lib/utils';

const getPaatospohja = async (paatospohjaId?: string): Promise<Paatospohja> => {
  const url = `paatospohja/${paatospohjaId}`;
  return await doApiFetch(url, undefined, 'no-store');
};

const putPaatospohja = async (paatospohja: Paatospohja) => {
  const url = `paatospohja`;
  return await doApiPut(url, paatospohja);
};

const deletePaatospohja = async (paatospohjaId?: string) => {
  const url = `paatospohja/${paatospohjaId}`;
  return await doApiDelete(url, undefined);
};

export const usePaatospohja = (paatospohjaId?: string) => {
  const queryKey = ['paatospohja', paatospohjaId];
  const queryClient = useQueryClient();

  const { addToast } = useToaster();
  const { t } = useTranslations();

  const query = useQuery({
    queryKey,
    queryFn: () => getPaatospohja(paatospohjaId),
    enabled: !!paatospohjaId,
    throwOnError: false,
  });

  const {
    mutate: updatePaatospohjaMutation,
    isPending: paatospohjaUpdateOngoing,
    isSuccess: paatospohjaUpdateSuccess,
    error: paatospohjaUpdateError,
    reset: paatospohjaUpdateReset,
  } = useMutation({
    mutationFn: (paatospohja: Paatospohja) => putPaatospohja(paatospohja),
  });

  const {
    mutate: poistaPaatospohjaMutation,
    isPending: poistoOngoing,
    isSuccess: poistoSuccess,
    error: poistoError,
    reset: paatospohjaPoistoReset,
  } = useMutation({
    mutationFn: () => deletePaatospohja(paatospohjaId),
  });

  const resetMutationStatuses = () => {
    paatospohjaUpdateReset();
    paatospohjaPoistoReset();
  };

  const updatePaatospohja = (
    paatospohja: Paatospohja,
    successCallback?: () => void,
  ) => {
    resetMutationStatuses();
    updatePaatospohjaMutation(paatospohja, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: paatospohjaListaQueryKey,
        });
        handleSuccessMessage(
          true,
          addToast,
          'tekstipohjat.paatospohjat.paatospohjaTallennus.success',
          t,
        );
        successCallback?.();
      },
    });
  };

  const poistaPaatospohja = (successCallback?: () => void) => {
    resetMutationStatuses();
    poistaPaatospohjaMutation(undefined, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: paatospohjaListaQueryKey,
        });
        handleSuccessMessage(
          true,
          addToast,
          'tekstipohjat.paatospohjat.paatospohjaPoisto.success',
          t,
        );
        successCallback?.();
      },
    });
  };

  return {
    updatePaatospohja: updatePaatospohja,
    poistaPaatospohja: poistaPaatospohja,
    paatospohja: query.data,
    isPaatospohjaLoading: query.isLoading,
    paatospohjaLoadingError: query.error,
    updateOngoing: paatospohjaUpdateOngoing,
    poistoOngoing,
    paatospohjaUpdateSuccess,
    paatospohjaUpdateError,
    poistoSuccess,
    poistoError,
  };
};
