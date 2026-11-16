import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { Paatospohja } from '@/src/lib/types/paatosteksti';
import { KategorianTekstipohjat, Viestipohja } from '@/src/lib/types/viesti';

export const useTekstipohjat = (url: string) => {
  const queryKey = [url === 'viestipohja' ? 'viestipohjat' : 'paatospohjat'];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<KategorianTekstipohjat[]> =>
      await doApiFetch(`${url}/kategorioittain`, undefined, 'no-store'),
    throwOnError: false,
  });

  return {
    tekstipohjat: query.data,
    isLoadingPohjat: query.isLoading,
    pohjatLoadError: query.error,
  };
};

export const useTekstipohjaSelect = (
  selectCb: (viestipohja: Viestipohja | Paatospohja) => void,
  url: string,
) => {
  const queryClient = useQueryClient();
  const [isLoadingPohja, setIsLoadingPohja] = useState(false);
  const [pohjaLoadError, setPohjaLoadError] = useState<Error | null>(null);

  return {
    selectTekstipohja: async (pohjaId: string) => {
      setIsLoadingPohja(true);
      setPohjaLoadError(null);
      try {
        const pohja = await queryClient.fetchQuery({
          queryKey: [url, pohjaId],
          queryFn: (): Promise<Viestipohja | Paatospohja> =>
            doApiFetch(`${url}/${pohjaId}`, undefined, 'no-store'),
          staleTime: 0,
        });
        selectCb(pohja);
      } catch (error) {
        setPohjaLoadError(error as Error);
      } finally {
        setIsLoadingPohja(false);
      }
    },
    isLoadingPohja,
    pohjaLoadError,
  };
};
