import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { Paginated } from '@/src/lib/types/paginated';

const getHakemuksetHaulla = async (
  haku: string,
  nakyma: string,
  page: number,
): Promise<Paginated<HakemusListItem>> => {
  const params = new URLSearchParams({ haku, nakyma, page: String(page) });

  return await doApiFetch(
    `hakemus/haku?${params.toString()}`,
    undefined,
    'no-store',
  );
};

export const useHakemuksetHaku = (
  haku: string,
  nakyma: string,
  page: number,
) => {
  const enabled = haku.trim().length > 0;
  return useQuery({
    queryKey: ['getHakemuksetHaulla', haku, nakyma, page],
    queryFn: () => getHakemuksetHaulla(haku, nakyma, page),
    enabled,
    throwOnError: false,
  });
};
