'use client';

import { createContext, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Hakemus, PartialHakemus } from '@/src/lib/types/hakemus';
import { doApiFetch, doApiPatch } from '@/src/lib/tutu-backend/api';

type HakemusContextValue = {
  hakemus: Hakemus | undefined;
  updateHakemus: (patch: PartialHakemus) => void;
  isLoading: boolean;
  isError?: boolean;
  error: Error | null;
  updateOngoing?: boolean;
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

  const { mutate, isPending } = useMutation({
    mutationFn: (patchHakemus: PartialHakemus) =>
      doApiPatch(`hakemus/${hakemus?.hakemusOid}`, patchHakemus),
    onMutate: async () => {
      // Cancel any outgoing refetches to prevent race conditions
      // This ensures that server responses arrive in order
      await queryClient.cancelQueries({
        queryKey: ['getHakemus', hakemus?.hakemusOid],
      });
    },
    onSuccess: async (response) => {
      // Update cache with server response (source of truth)
      const paivitettyHakemus = await response.json();
      queryClient.setQueryData(
        ['getHakemus', hakemus?.hakemusOid],
        paivitettyHakemus,
      );
    },
    onError: () => {
      // On error, invalidate to refetch and ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['getHakemus', hakemus?.hakemusOid],
      });
    },
  });

  const updateHakemus = (patchHakemus: PartialHakemus) => {
    mutate(patchHakemus);
  };

  return (
    <HakemusContext.Provider
      value={{
        hakemus,
        updateHakemus,
        isLoading,
        error,
        updateOngoing: isPending,
      }}
    >
      {children}
    </HakemusContext.Provider>
  );
};
