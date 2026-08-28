import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useEditableState } from '@/src/hooks/useEditableState';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Valitustiedot } from '@/src/lib/types/valitustiedot';

const getValitustiedot = async (
  hakemusOid: string | undefined,
): Promise<Valitustiedot> => {
  return await doApiFetch(`valitustiedot/${hakemusOid}`, undefined, 'no-store');
};

const putValitustiedot = (hakemusOid: string, valitustiedot: Valitustiedot) => {
  return doApiPut(`valitustiedot/${hakemusOid}`, valitustiedot);
};

export const useValitustiedot = (hakemusOid?: string) => {
  const { t } = useTranslations();
  const { addToast } = useToaster();

  const queryClient = useQueryClient();
  const queryKey = ['valitustiedot', hakemusOid];

  const {
    data: valitustiedot,
    error: queryError,
    isLoading: queryLoading,
  } = useQuery<Valitustiedot>({
    queryKey: queryKey,
    queryFn: () => getValitustiedot(hakemusOid),
    enabled: !!hakemusOid,
  });

  const {
    mutate,
    isPending: isUpdateOngoing,
    error: updateError,
  } = useMutation({
    mutationFn: (valitustiedot: Valitustiedot) =>
      putValitustiedot(hakemusOid!, valitustiedot),
    onSuccess: async (response) => {
      const paivitettyValitustiedot = await response.json();
      queryClient.setQueryData(queryKey, paivitettyValitustiedot);
      // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
      await queryClient.invalidateQueries({
        queryKey: ['getHakemus', hakemusOid],
      });
      addToast({
        key: 'hakemus.valitustiedot.toast.success',
        message: t('hakemus.valitustiedot.tallennusOnnistui'),
        type: 'success',
      });
    },
  });

  const valitustiedotState = useEditableState(valitustiedot, mutate);

  return {
    valitustiedot: valitustiedotState.editedData,
    paivitaValitustiedot: valitustiedotState.updateLocal,
    tallennaValitustiedot: valitustiedotState.save,
    hasChanges: valitustiedotState.hasChanges,
    discard: valitustiedotState.discard,
    queryError,
    queryLoading,
    isUpdateOngoing,
    updateError,
  };
};
