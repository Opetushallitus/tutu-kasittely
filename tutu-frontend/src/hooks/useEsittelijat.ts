import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';
import { Esittelija } from '@/src/lib/types/esittelija';
import * as R from 'remeda';
import { emptyOption } from '@/src/constants/dropdownOptions';

export const getEsittelijat = async (): Promise<Esittelija[]> => {
  return await doApiFetch('esittelijat', undefined, 'no-store');
};

export const useEsittelijat = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['getEsittelijat'],
    queryFn: getEsittelijat,
    staleTime: Infinity,
  });

  const uniqueEsittelijat = R.uniqueBy(data ?? [], (e) => e.esittelijaOid);

  const options = isLoading
    ? []
    : emptyOption.concat(
        R.map(
          R.sortBy(uniqueEsittelijat, (esittelija) => esittelija.etunimi),
          (esittelija) => ({
            value: esittelija.esittelijaOid,
            label: `${esittelija.etunimi} ${esittelija.sukunimi}`,
          }),
        ),
      );

  return { data, isLoading, options };
};
