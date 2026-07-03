'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { isDeepEqual } from 'remeda';

import { doApiDelete, doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';

import { EditableState, normalize } from './useEditableState';
import { AsiakirjaPyynto, AsiakirjaTieto } from '../lib/types/hakemus';

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
  const [isDeleting, setIsDeleting] = useState(false);

  const discard = () => {
    setLocalAsiakirja(query.data);
  };

  useEffect(() => {
    setLocalAsiakirja(query.data);
  }, [query.data]);

  const mutationTallenna = useMutation({
    mutationFn: (asiakirjat: AsiakirjaTieto) =>
      putAsiakirjat(hakemusOid!, asiakirjat),
    onSuccess: async (response) => {
      const paivitettyAsiakirjat = await response.json();
      queryClient.setQueryData(queryKey, paivitettyAsiakirjat);
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

  const poistaPyydettavaAsiakirja = async (poistettava: AsiakirjaPyynto) => {
    setIsDeleting(true);
    const serverAsiakirjat = query.data?.pyydettavatAsiakirjat;
    const oldLocalAsiakirjat = localAsiakirja?.pyydettavatAsiakirjat;
    if (!serverAsiakirjat || !oldLocalAsiakirjat) return;
    await deletePyydettavaAsiakirja(hakemusOid!, poistettava.id!);

    const { data } = await query.refetch();
    await queryClient.invalidateQueries({
      queryKey: ['getHakemus', hakemusOid],
    });
    setLocalAsiakirja(data!);
    setIsDeleting(false);
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
    isSaving: mutationTallenna.isPending || isDeleting,
    isUpdateSuccess: mutationTallenna.isSuccess,
    updateError: mutationTallenna.error,
  };
};
