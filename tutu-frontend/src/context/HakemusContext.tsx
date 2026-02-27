'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext } from 'react';

import { EditableState, useEditableState } from '@/src/hooks/useEditableState';
import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Hakemus, HakemusUpdateRequest } from '@/src/lib/types/hakemus';
import { buildHakemusUpdateRequest } from '@/src/lib/utils';

type HakemusContextValue = {
  hakemusState: EditableState<Hakemus>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  updateError: Error | null;
  isSaving: boolean;
};

export const HAKEMUS_MUUTOSHISTORIA_SORT_KEY = 'hakemus-muutoshistoria-sort';

const getHakemus = async (hakemusOid: string): Promise<Hakemus> => {
  const sortParam = localStorage.getItem(HAKEMUS_MUUTOSHISTORIA_SORT_KEY);
  const resource = sortParam
    ? `hakemus/${hakemusOid}?hakemusMuutoshistoriaSort=${sortParam.split(':').at(-1)}`
    : `hakemus/${hakemusOid}`;
  return await doApiFetch(resource, undefined, 'no-store');
};

const HakemusContext = createContext<HakemusContextValue | null>(null);

export const useHakemus = () => {
  const ctx = useContext(HakemusContext);
  if (!ctx) throw new Error('useHakemus must be used within HakemusProvider');
  return ctx;
};

export const HakemusProvider = ({
  hakemusOid,
  children,
}: {
  hakemusOid: string;
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();
  const {
    data: hakemus,
    isLoading,
    error,
    isError: isQueryError,
  } = useQuery({
    queryKey: ['getHakemus', hakemusOid],
    queryFn: () => getHakemus(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const {
    mutate: tallennaHakemus,
    isPending: isSaving,
    isError: isUpdateError,
    error: updateError,
  } = useMutation({
    mutationFn: (hakemusUpdate: HakemusUpdateRequest) =>
      doApiPut(`hakemus/${hakemus?.hakemusOid}`, hakemusUpdate),
    onSuccess: async (response) => {
      const paivitettyHakemus = await response.json();

      queryClient.setQueryData(
        ['getHakemus', hakemus?.hakemusOid],
        paivitettyHakemus,
      );
    },
  });

  const hakemusState = useEditableState(hakemus, (hakemusData: Hakemus) => {
    tallennaHakemus(buildHakemusUpdateRequest(hakemusData));
  });

  return (
    <HakemusContext.Provider
      value={{
        hakemusState,
        isLoading,
        isError: isQueryError || isUpdateError,
        error,
        updateError,
        isSaving,
      }}
    >
      {children}
    </HakemusContext.Provider>
  );
};
