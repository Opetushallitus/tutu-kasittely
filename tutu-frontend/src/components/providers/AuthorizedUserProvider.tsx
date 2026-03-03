'use client';
import { useQuery } from '@tanstack/react-query';
import React, { useContext, createContext, ReactNode, useState } from 'react';

import { FullSpinner } from '@/src/components/FullSpinner';
import { useFetchUser } from '@/src/hooks/useFetchUser';
import { consumePostLoginRedirectUrl } from '@/src/lib/navigation/postLoginRedirect';
import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { User } from '@/src/lib/types/user';

const AuthorizedUserContext = createContext<User | null>(null);

export function AuthorizedUserProvider({ children }: { children: ReactNode }) {
  const [redirecting] = useState(() => {
    const returnUrl = consumePostLoginRedirectUrl();
    if (
      returnUrl &&
      returnUrl !==
        `${window.location.pathname}${window.location.search}${window.location.hash}`
    ) {
      window.location.replace(returnUrl);
      return true;
    }
    return false;
  });

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

  if (redirecting || isLoading) {
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
