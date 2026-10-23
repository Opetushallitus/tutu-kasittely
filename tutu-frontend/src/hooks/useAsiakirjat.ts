import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { isDeepEqual } from 'remeda';

import { EditableState, normalize } from './useEditableState';
import { AsiakirjaPyynto, AsiakirjaTieto } from '../lib/types/hakemus';

import { doApiDelete, doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';

export type AsiakirjaState = Omit<
  EditableState<AsiakirjaTieto>,
  'updateImmediately'
>;

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

const deletePyydettavaAsiakirja = (hakemusOid: string, asiakirjaId: string) => {
  const url = `hakemus/${hakemusOid}/asiakirjat/${asiakirjaId}`;
  return doApiDelete(url);
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

  const [localAsiakirja, setLocalAsiakirja] = useState(query.data);
  const [isUpdateSuccess, setIsUpdateSuccess] = useState<boolean | undefined>(
    undefined,
  );

  const discard = () => {
    setLocalAsiakirja(query.data);
  };

  useEffect(() => {
    setLocalAsiakirja(query.data);
  }, [query.data]);

  const mutationTallenna = useMutation({
    mutationFn: (asiakirjat: AsiakirjaTieto) =>
      putAsiakirjat(hakemusOid!, asiakirjat),
    onMutate: () => {
      setIsUpdateSuccess(undefined);
    },
    onSuccess: async (response) => {
      const paivitettyAsiakirjat = await response.json();
      queryClient.setQueryData(queryKey, paivitettyAsiakirjat);
      setIsUpdateSuccess(true);
      // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
      await queryClient.invalidateQueries({
        queryKey: ['getHakemus', hakemusOid],
      });
    },
  });

  const hasChanges = useMemo(() => {
    if (!localAsiakirja || !query.data) return false;
    return !isDeepEqual(normalize(localAsiakirja), normalize(query.data));
  }, [localAsiakirja, query.data]);

  const tallennaAsiakirjat = () => {
    if (hasChanges) {
      mutationTallenna.mutate(localAsiakirja!);
    }
  };

  const mutationPoista = useMutation({
    mutationFn: (poistettava: AsiakirjaPyynto) =>
      deletePyydettavaAsiakirja(hakemusOid!, poistettava.id),
    onMutate: () => {
      setIsUpdateSuccess(undefined);
    },
    onSuccess: async () => {
      const { data } = await query.refetch();
      await queryClient.invalidateQueries({
        queryKey: ['getHakemus', hakemusOid],
      });
      setLocalAsiakirja(data!);
      setIsUpdateSuccess(true);
    },
  });

  const poistaPyydettavaAsiakirja = (poistettava: AsiakirjaPyynto) => {
    const serverAsiakirjat = query.data?.pyydettavatAsiakirjat;
    if (!serverAsiakirjat || !localAsiakirja) return;

    // Poistetaan tallentamaton pyyntö vain lokaalisti
    if (!serverAsiakirjat.some((pyynto) => pyynto.id === poistettava.id)) {
      setLocalAsiakirja({
        ...localAsiakirja,
        pyydettavatAsiakirjat: localAsiakirja.pyydettavatAsiakirjat.filter(
          (pyynto) => pyynto.id !== poistettava.id,
        ),
      });
      return;
    }

    mutationPoista.mutate(poistettava);
  };

  return {
    ...query,
    asiakirjaState: {
      updateLocal: setLocalAsiakirja,
      hasChanges,
      save: tallennaAsiakirjat,
      editedData: localAsiakirja,
      discard,
    } as AsiakirjaState,
    poistaPyydettavaAsiakirja,
    isLoading: query.isLoading,
    isSaving: mutationTallenna.isPending || mutationPoista.isPending,
    isUpdateSuccess: isUpdateSuccess,
    updateError: mutationTallenna.error,
    deleteError: mutationPoista.error,
  };
};
