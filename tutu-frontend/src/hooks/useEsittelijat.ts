import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';
import { Esittelija } from '@/src/lib/types/esittelija';

export const getEsittelijat = async (): Promise<Esittelija[]> => {
  return await doApiFetch('esittelijat', undefined, 'no-store');
};

export const useEsittelijat = () =>
  useQuery({
    queryKey: ['getEsittelijat'],
    queryFn: getEsittelijat,
    staleTime: Infinity,
  });
