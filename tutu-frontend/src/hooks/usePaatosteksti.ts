import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Paatosteksti } from '@/src/lib/types/paatosteksti';
import { handleSuccessMessage } from '@/src/lib/utils';

const getPaatosteksti = async (hakemusOid: string): Promise<Paatosteksti> => {
  const url = `paatos/${hakemusOid}/paatosteksti`;

  return await doApiFetch(url);
};

type MutateParameters = {
  paatosteksti: Paatosteksti;
  vahvista?: boolean;
  successCallback?: () => void;
};

const putPaatosteksti = (hakemusOid: string, params: MutateParameters) => {
  const url = `paatos/${hakemusOid}/paatosteksti/${params.paatosteksti.id}${params.vahvista ? `/vahvista` : ''}`;

  return doApiPut(url, params.paatosteksti);
};

export const usePaatosteksti = (hakemusOid: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['paatosteksti', hakemusOid];

  const { addToast } = useToaster();
  const { t } = useTranslations();

  const query = useQuery({
    queryKey: queryKey,
    queryFn: () => getPaatosteksti(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const {
    mutate,
    isPending,
    isSuccess,
    error: updateError,
  } = useMutation({
    mutationFn: (parameters: MutateParameters) =>
      putPaatosteksti(hakemusOid!, parameters),
    onSuccess: async (response, { vahvista, successCallback }) => {
      const paivitettyPaatosteksti = await response.json();
      queryClient.setQueryData(queryKey, paivitettyPaatosteksti);
      if (vahvista) {
        // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
        queryClient.invalidateQueries({
          queryKey: ['getHakemus', hakemusOid],
        });

        // Invalidoi myös päätös, koska vahvistettu tila vaikuttaa sivupalkkiin
        queryClient.invalidateQueries({
          queryKey: ['paatos', hakemusOid],
        });
      }
      handleSuccessMessage(
        true,
        addToast,
        vahvista
          ? 'hakemus.editori.paatos.paatostekstiVahvista.success'
          : 'hakemus.editori.paatos.paatostekstiTallennus.success',
        t,
      );
      successCallback?.();
    },
  });

  const savePaatosteksti = (
    paatosteksti: Paatosteksti,
    vahvista?: boolean,
    successCallback?: () => void,
  ) => {
    mutate({ paatosteksti, vahvista, successCallback });
  };

  return {
    paatosteksti: query.data,
    savePaatosteksti,
    isSuccess: query.isSuccess,
    isLoading: query.isLoading,
    error: query.error,
    updateOngoing: isPending,
    updateSuccess: isSuccess,
    updateError: updateError,
  };
};
