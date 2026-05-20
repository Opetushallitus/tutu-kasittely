import { useQuery } from '@tanstack/react-query';

import { Paatospohja } from '@/src/lib/types/paatosteksti';

export const usePaatospohja = (paatospohjaId?: string) => {
  const paatospohja: Paatospohja = {
    nimi: '',
    kategoriaId: '',
    sisalto: {
      fi: '',
      sv: '',
    },
  };
  const queryKey = ['paatospohja', paatospohjaId];

  const query = useQuery({
    queryKey,
    queryFn: () => Promise.resolve(paatospohja),
    enabled: !!paatospohjaId,
    throwOnError: false,
  });

  return {
    paatospohja: query.data,
    updatePaatospohja: (paatospohja: Paatospohja) => {
      console.log('Tallenna paatospohja', paatospohja);
    },
    poistaPaatospohja: () => {
      console.log(`Poistetaan paatospohja ${paatospohjaId}`);
    },
    isPaatospohjaLoading: false,
  };
};
