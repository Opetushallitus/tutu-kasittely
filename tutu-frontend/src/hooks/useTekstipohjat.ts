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
  const [pohjaId, setPohjaId] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: ['viestipohja', pohjaId],
    queryFn: async (): Promise<Viestipohja | undefined> =>
      await doApiFetch(`viestipohja/${pohjaId}`, undefined, 'no-store').then(
        (viestipohja: Viestipohja) => {
          selectCb(viestipohja);
          return viestipohja;
        },
      ),
    enabled: !!pohjaId,
    throwOnError: false,
  });
  return {
    selectTekstipohja: (pohjaId: string) => setPohjaId(pohjaId),
    isLoadingPohja: query.isLoading,
    pohjaLoadError: query.error,
  };
};
