import { useQuery, useQueryClient } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { VahvistettuViestiListItem } from '@/src/lib/types/viesti';

export const VAHVISTETUT_VIESTIT_SORT_KEY = 'tutu-viestit-sort';

const getVahvistetutViestit = async (
  hakemusOid: string,
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

export const useVahvistetutViestit = (hakemusOid: string) => {
  const queryKey = ['vahvistetutViestit', hakemusOid];

  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const query = useQuery({
    queryKey,
    queryFn: () => getVahvistetutViestit(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  return { ...query, viestiLista: query.data, refresh };
};
