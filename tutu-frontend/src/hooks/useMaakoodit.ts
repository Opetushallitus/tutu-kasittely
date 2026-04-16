import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

const updateMaakoodit = async (updateList: Maakoodi[]): Promise<Response> => {
  const url = `maakoodit`;
  return doApiPut(url, updateList);
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

export const useUpdateMaakoodit = () => {
  const queryClient = useQueryClient();

  const {
    mutate,
    isPending: isUpdateOngoing,
    isSuccess: isUpdateSuccess,
    error: updateError,
  } = useMutation({
    mutationFn: (maakoodit: Maakoodi[]) => updateMaakoodit(maakoodit),
    onSuccess: async (_) => {
      await queryClient.invalidateQueries({ queryKey: ['getMaakoodit'] });
    },
  });

  const update = (maakoodit: Maakoodi[]) => {
    mutate(maakoodit);
  };

  return {
    update,
    isUpdateOngoing,
    isUpdateSuccess,
    updateError,
  };
};
