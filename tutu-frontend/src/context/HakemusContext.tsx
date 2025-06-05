'use client';

import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Hakemus } from '@/src/lib/types/hakemus';
import { doApiFetch } from '@/src/lib/tutu-backend/api';

type HakemusContextValue = {
  hakemus: Hakemus | undefined;
  isLoading: boolean;
  error: unknown;
};

const getHakemus = async (hakemusOid: string): Promise<Hakemus> => {
  return await doApiFetch(`hakemus/${hakemusOid}`, undefined, 'no-store');
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
  const {
    data: hakemus,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getHakemus', hakemusOid],
    queryFn: () => getHakemus(hakemusOid),
    enabled: !!hakemusOid,
  });

  return (
    <HakemusContext.Provider value={{ hakemus, isLoading, error }}>
      {children}
    </HakemusContext.Provider>
  );
};
