'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doApiDelete, doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Tutkinto } from '@/src/lib/types/tutkinto';
import { useEffect, useMemo, useState } from 'react';
import { isDeepEqual } from 'remeda';
import { updateTutkintoJarjestys } from '@/src/lib/utils';

const getTutkinnot = async (hakemusOid?: string): Promise<Tutkinto[]> => {
  const url = `hakemus/${hakemusOid}/tutkinto/`;
  return await doApiFetch(url, undefined, 'no-store');
};

const putTutkinnot = (hakemusOid: string, tutkinnot: Tutkinto[]) => {
  const url = `hakemus/${hakemusOid}/tutkinto/`;
  return doApiPut(url, tutkinnot);
};

const putTutkinto = (hakemusOid: string, tutkinto: Tutkinto) => {
  const url = `hakemus/${hakemusOid}/tutkinto/${tutkinto.id}`;
  return doApiPut(url, tutkinto);
};

const deleteTutkinto = (hakemusOid: string, tutkintoId: string) => {
  const url = `hakemus/${hakemusOid}/tutkinto/${tutkintoId}`;
  return doApiDelete(url);
};

export const useTutkinnot = (hakemusOid: string | undefined) => {
  const queryKey = ['tutkinnot', hakemusOid];

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => getTutkinnot(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const [localTutkinnot, setLocalTutkinnot] = useState(query.data);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateLocal = (tutkinnot?: Tutkinto[]) => {
    setLocalTutkinnot(
      tutkinnot?.sort((a, b) => a.jarjestys.localeCompare(b.jarjestys)),
    );
  };

  useEffect(() => {
    updateLocal(query.data);
  }, [query.data]);

  const mutationTallenna = useMutation({
    mutationFn: (tutkinnot: Tutkinto[]) => putTutkinnot(hakemusOid!, tutkinnot),
    onSuccess: async (response) => {
      const paivitetytTutkinnot = await response.json();
      queryClient.setQueryData(queryKey, paivitetytTutkinnot);
      // Invalidoi myös hakemus, koska kasittelyVaihe voi muuttua
      await queryClient.invalidateQueries({
        queryKey: ['getHakemus', hakemusOid],
      });
    },
  });

  const poistaTutkinto = async (poistettava: Tutkinto) => {
    setIsDeleting(true);
    const serverTutkinnot = query.data;
    const oldLocalTutkinnot = localTutkinnot;
    if (!serverTutkinnot || !oldLocalTutkinnot) return;
    await deleteTutkinto(hakemusOid!, poistettava.id!);

    // haetaan ja päivitetään vanhat tutkinnot joiden järjestys muuttuu tutkinnon poistamisen seurauksena
    if (serverTutkinnot.length > parseInt(poistettava.jarjestys)) {
      const muutettavat = serverTutkinnot.filter(
        (t) =>
          t.id &&
          !t.id.startsWith('new') &&
          t.id !== poistettava.id &&
          t.jarjestys !== 'MUU' &&
          parseInt(t.jarjestys) > parseInt(poistettava.jarjestys),
      );
      await Promise.all([
        muutettavat.map((t) => {
          putTutkinto(hakemusOid!, {
            ...t,
            jarjestys: (parseInt(t.jarjestys) - 1).toString(),
          });
        }),
      ]);
    }
    const { data } = await query.refetch();
    await queryClient.invalidateQueries({
      queryKey: ['getHakemus', hakemusOid],
    });
    setLocalTutkinnot(
      data!
        // palautetaan vanhat muutokset
        .map((t) => ({
          ...t,
          ...oldLocalTutkinnot?.find((lT) => lT.id === t.id),
        }))
        // lisätään tallentamattomat uudet tutkinnot
        .concat(
          oldLocalTutkinnot
            .filter((t) => t.id?.startsWith('new'))
            .map((t) => updateTutkintoJarjestys(t, poistettava.jarjestys)),
        ),
    );
    setIsDeleting(false);
  };

  const hasChanges = useMemo(() => {
    if (!localTutkinnot || !query.data) return false;
    return !isDeepEqual(localTutkinnot, query.data);
  }, [localTutkinnot, query.data]);

  const save = () => {
    if (hasChanges) {
      mutationTallenna.mutate(
        localTutkinnot!.map((t) =>
          // poistetaan placeholder id:t
          t.id?.startsWith('new') ? { ...t, id: undefined } : t,
        ),
      );
    }
  };

  return {
    ...query,
    tutkintoState: {
      updateLocal,
      hasChanges,
      save,
      editedData: localTutkinnot,
    },
    poistaTutkinto,
    isPerusteluLoading: query.isLoading,
    isSaving: mutationTallenna.isPending || isDeleting,
  };
};
