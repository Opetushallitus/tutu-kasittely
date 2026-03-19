import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { VahvistettuViestiListItem, Viesti } from '@/src/lib/types/viesti';

export const VAHVISTETUT_VIESTIT_SORT_KEY = 'tutu-viestit-sort';

const getVahvistetutViestit = async (
  hakemusOid?: string,
): Promise<VahvistettuViestiListItem[]> => {
  const viestiListaSortParam = localStorage.getItem(
    VAHVISTETUT_VIESTIT_SORT_KEY,
  );
  const baseUrl = `viestilista/${hakemusOid}`;
  const url = viestiListaSortParam
    ? `${baseUrl}?sort=${viestiListaSortParam}`
    : baseUrl;

  return await doApiFetch(url, undefined, 'no-store');
};

export const useVahvistetutViestit = (hakemusOid?: string) => {
  const queryKey = useMemo(
    () => ['vahvistetutViestit', hakemusOid],
    [hakemusOid],
  );

  const queryClient = useQueryClient();

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const query = useQuery({
    queryKey,
    queryFn: () => getVahvistetutViestit(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  return {
    ...query,
    viestiLista: query.data,
    refresh: refresh,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useVahvistettuViesti = (id?: string) => {
  const queryKey = ['vahvistettuViesti', id];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<Viesti> =>
      await doApiFetch(`viesti/${id}`, undefined, 'no-store'),
    enabled: !!id,
    throwOnError: false,
  });

  return {
    ...query,
    viesti: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};
