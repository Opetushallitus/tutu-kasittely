import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';
import { Maakoodi } from '@/src/lib/types/maakoodi';

export const getMaakoodit = async (): Promise<Maakoodi[]> => {
  return await doApiFetch('maakoodit', undefined, 'no-store');
};

interface UseMaakooditOptions {
  enabled?: boolean;
}

export const useMaakoodit = (options?: UseMaakooditOptions) => {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getMaakoodit'],
    queryFn: getMaakoodit,
    staleTime: Infinity,
    throwOnError: false,
    enabled: options?.enabled,
  });

  return { data, isLoading, error };
};
