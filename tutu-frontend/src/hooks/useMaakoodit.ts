import { useQuery, useQueryClient } from '@tanstack/react-query';

import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import { Maakoodi } from '@/src/lib/types/maakoodi';

const getMaakoodit = async (): Promise<Maakoodi[]> => {
  return await doApiFetch('maakoodi', undefined, 'no-store');
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

const updateMaakoodi = async (
  id: string,
  esittelijaId?: string,
): Promise<void> => {
  const url = `maakoodi?id=${id}${esittelijaId ? `&esittelijaId=${esittelijaId}` : ''}`;
  await doApiPut(url, {});
};

const updateMaakoodit = async (updateList: Maakoodi[]): Promise<void> => {
  const url = `maakoodit`;
  await doApiPut(url, updateList);
};

interface UseUpdateMaakoodiOptions {
  enabled?: boolean;
  onSuccess?: () => void;
}

export const useUpdateMaakoodi = (
  id?: string,
  esittelijaId?: string,
  options?: UseUpdateMaakoodiOptions,
) => {
  const queryClient = useQueryClient();

  const { refetch: update } = useQuery({
    queryKey: ['updateMaakoodi', id, esittelijaId],
    queryFn: async () => {
      if (!id) return null;
      await updateMaakoodi(id, esittelijaId);
      await queryClient.invalidateQueries({ queryKey: ['getMaakoodit'] });
      options?.onSuccess?.();
      return null;
    },
    enabled: Boolean(options?.enabled && id),
  });

  return update;
};

export const useUpdateMaakoodit = (
  updateList: Maakoodi[],
  onSuccess?: () => void,
) => {
  const queryClient = useQueryClient();

  const { refetch: update } = useQuery({
    queryKey: ['updateMaakoodit'],
    queryFn: async () => {
      if (updateList.length === 0) return null;
      await updateMaakoodit(updateList);
      await queryClient.invalidateQueries({ queryKey: ['getMaakoodit'] });
      onSuccess?.();
      return null;
    },
    enabled: updateList.length > 0,
  });

  return update;
};
