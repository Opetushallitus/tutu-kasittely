'use client';
import React, { useContext, createContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

import { FullSpinner } from '@/components/full-spinner';
import { useFetchUser } from '@/hooks/useFetchUser';
import { User } from '@/lib/types/common';
import { doApiFetch } from '@/lib/tutu-backend/api';

const AuthorizedUserContext = createContext<User | null>(null);

export function AuthorizedUserProvider({ children }: { children: ReactNode }) {
  const user = useFetchUser();

  const { isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      // api hoitaa virheenkäsittelyn ja http 401 tilanteen uudelleenohjauksen
      const response = await doApiFetch('session', {}, 'no-store');
      return response; // jotain on pakko palauttaa querysta vaikka sitä ei käytetä
    },
    refetchInterval: 60000, // Pollataan session voimassaoloa 60 sekunnin välein
    staleTime: 0, // Ei cachea
    enabled: true,
    retry: false,
  });

  if (isLoading) {
    return <FullSpinner />;
  }

  return (
    <AuthorizedUserContext.Provider value={user}>
      {children}
    </AuthorizedUserContext.Provider>
  );
}

export function useAuthorizedUser() {
  return useContext(AuthorizedUserContext);
}
