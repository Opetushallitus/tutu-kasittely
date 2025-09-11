import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';
import { Esittelija } from '@/src/lib/types/esittelija';
import * as R from 'remeda';

export const getEsittelijat = async (): Promise<Esittelija[]> => {
  return await doApiFetch('esittelijat', undefined, 'no-store');
};

interface UseEsittelijatOptions {
  enabled?: boolean;
}

export const useEsittelijat = (options?: UseEsittelijatOptions) => {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getEsittelijat'],
    queryFn: getEsittelijat,
    staleTime: Infinity,
    throwOnError: false,
    enabled: options?.enabled,
  });

  const uniqueEsittelijat = R.uniqueBy(data ?? [], (e) => e.esittelijaOid);

  const selectOptions =
    isLoading || error
      ? []
      : R.map(
          R.sortBy(uniqueEsittelijat, (esittelija) => esittelija.etunimi),
          (esittelija) => ({
            value: esittelija.esittelijaOid,
            label: `${esittelija.etunimi} ${esittelija.sukunimi}`,
            ...(esittelija.id ? { id: esittelija.id } : {}),
          }),
        );

  return { data, isLoading, options: selectOptions, error };
};
