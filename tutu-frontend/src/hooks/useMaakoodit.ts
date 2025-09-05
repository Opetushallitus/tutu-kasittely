import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';
import { Maakoodi } from '@/src/lib/types/maakoodi';

export const getMaakoodit = async (): Promise<Maakoodi[]> => {
  return await doApiFetch('maakoodit', undefined, 'no-store');
};

export const useMaakoodit = () => {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getMaakoodit'],
    queryFn: getMaakoodit,
    staleTime: Infinity,
    throwOnError: false,
  });

  return { data, isLoading, error };
};
