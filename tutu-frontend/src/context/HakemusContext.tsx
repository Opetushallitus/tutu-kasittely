'use client';

import { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Hakemus, HakemusUpdateRequest } from '@/src/lib/types/hakemus';
import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';

type HakemusContextValue = {
  hakemus: Hakemus | undefined;
  tallennaHakemus: (hakemus: HakemusUpdateRequest) => void;
  isLoading: boolean;
  isError?: boolean;
  error: Error | null;
  isSaving?: boolean;
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
  } = useQuery({
    queryKey: ['getHakemus', hakemusOid],
    queryFn: () => getHakemus(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  const { mutate: tallennaHakemus, isPending: isSaving } = useMutation({
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

  return (
    <HakemusContext.Provider
      value={{
        hakemus,
        tallennaHakemus,
        isLoading,
        error,
        isSaving,
      }}
    >
      {children}
    </HakemusContext.Provider>
  );
};
