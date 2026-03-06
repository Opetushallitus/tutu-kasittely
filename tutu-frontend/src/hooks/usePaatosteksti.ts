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

const putPaatosteksti = (
  hakemusOid: string,
  paatosteksti: Paatosteksti,
  vahvista?: boolean,
) => {
  const url = `paatos/${hakemusOid}/paatosteksti/${paatosteksti.id}${vahvista ? `/vahvista` : ''}`;

  return doApiPut(url, paatosteksti);
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
    mutationFn: ({
      paatosteksti,
      vahvista,
    }: {
      paatosteksti: Paatosteksti;
      vahvista?: boolean;
    }) => putPaatosteksti(hakemusOid!, paatosteksti, vahvista),
    onSuccess: async (response, { vahvista }) => {
      const paivitettyPaatosteksti = await response.json();
      queryClient.setQueryData(queryKey, paivitettyPaatosteksti);
      if (vahvista) {
        // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
        await queryClient.invalidateQueries({
          queryKey: ['getHakemus', hakemusOid],
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
    },
  });

  const savePaatosteksti = (paatosteksti: Paatosteksti, vahvista?: boolean) => {
    mutate({ paatosteksti, vahvista });
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
