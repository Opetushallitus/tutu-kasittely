import { useQuery } from '@tanstack/react-query';
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
  const [pohjaId, setPohjaId] = useState<string | undefined>(undefined);

  const query = useQuery({
    queryKey: [url, pohjaId],
    queryFn: async (): Promise<Viestipohja | undefined> =>
      await doApiFetch(`${url}/${pohjaId}`, undefined, 'no-store').then(
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
