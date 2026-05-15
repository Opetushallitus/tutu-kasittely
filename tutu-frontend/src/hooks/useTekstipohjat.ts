import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { KategorianTekstipohjat, Viestipohja } from '@/src/lib/types/viesti';

export const useTekstipohjat = () => {
  const queryKey = ['viestipohjat'];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<KategorianTekstipohjat[]> =>
      await doApiFetch('viestipohja/kategorioittain', undefined, 'no-store'),
    throwOnError: false,
  });

  return {
    tekstipohjat: query.data,
    isLoadingPohjat: query.isLoading,
    pohjatLoadError: query.error,
  };
};

export const useTekstipohjaSelect = (
  selectCb: (viestipohja: Viestipohja) => void,
) => {
  const [queryKey, setQueryKey] = useState(['viestipohja', undefined]);

  const query = useQuery({
    queryKey,
    queryFn: async ({ queryKey }): Promise<Viestipohja | undefined> => {
      const pohjaId = queryKey.length == 2 && queryKey[1] ? queryKey[1] : null;
      if (pohjaId) {
        return await doApiFetch(
          `viestipohja/${pohjaId}`,
          undefined,
          'no-store',
        ).then((viestipohja: Viestipohja) => {
          selectCb(viestipohja);
          return viestipohja;
        });
      }
      return Promise.resolve(undefined);
    },
    enabled: queryKey.length == 2 && queryKey[1] !== undefined,
    throwOnError: false,
  });
  return {
    selectTekstipohja: (pohjaId: string) =>
      setQueryKey(['viestipohja', pohjaId]),
    isLoadingPohja: query.isLoading,
    pohjaLoadError: query.error,
  };
};
