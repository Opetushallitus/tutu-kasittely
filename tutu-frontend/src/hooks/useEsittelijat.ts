import { useQuery } from '@tanstack/react-query';
import * as R from 'remeda';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { Esittelija } from '@/src/lib/types/esittelija';

const getEsittelijat = async (): Promise<Esittelija[]> => {
  return await doApiFetch('esittelijat', undefined, 'no-store');
};

export const useEsittelijat = () => {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getEsittelijat'],
    queryFn: getEsittelijat,
    select: (data) =>
      R.sortBy(
        data ?? [],
        (e) => e.sukunimi,
        (e) => e.etunimi,
      ),
    staleTime: Infinity,
    throwOnError: false,
  });

  const uniqueEsittelijat = R.uniqueBy(data ?? [], (e) => e.esittelijaOid);

  const selectOptions =
    isLoading || error
      ? []
      : R.map(uniqueEsittelijat, (esittelija) => ({
          value: esittelija.esittelijaOid,
          label: `${esittelija.etunimi} ${esittelija.sukunimi}`,
          ...(esittelija.id ? { id: esittelija.id } : {}),
        }));

  return { data, isLoading, options: selectOptions, error };
};
