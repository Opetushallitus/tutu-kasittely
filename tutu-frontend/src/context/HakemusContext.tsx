'use client';

import { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Hakemus } from '@/src/lib/types/hakemus';
import { doApiFetch, doApiPatch } from '@/src/lib/tutu-backend/api';

type HakemusContextValue = {
  hakemus: Hakemus | undefined;
  updateHakemus: (patch: Partial<Hakemus>) => void;
  isLoading: boolean;
  error: unknown;
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
  });

  const mutation = useMutation({
    mutationFn: (patchHakemus: Partial<Hakemus>) =>
      doApiPatch(`hakemus/${hakemus?.hakemusOid}`, patchHakemus),
    onSuccess: async (response) => {
      const paivitettyHakemus = await response.json();

      queryClient.setQueryData(
        ['getHakemus', hakemus?.hakemusOid],
        paivitettyHakemus,
      );
    },
  });

  const updateHakemus = (patchHakemus: Partial<Hakemus>) => {
    mutation.mutate(patchHakemus);
  };

  return (
    <HakemusContext.Provider
      value={{ hakemus, updateHakemus, isLoading, error }}
    >
      {children}
    </HakemusContext.Provider>
  );
};
