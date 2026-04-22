import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { Paginated } from '@/src/lib/types/paginated';

const getHakemuksetHaulla = async (
  haku: string,
  nakyma: string,
): Promise<Paginated<HakemusListItem>> => {
  const params = new URLSearchParams({ haku });
  if (nakyma !== 'kaikki') {
    params.set('nakyma', nakyma);
  }

  return await doApiFetch(
    `hakemus/haku?${params.toString()}`,
    undefined,
    'no-store',
  );
};

export const useHakemuksetHaku = (haku: string, nakyma: string) =>
  useQuery({
    queryKey: ['getHakemuksetHaulla'],
    queryFn: () => getHakemuksetHaulla(haku, nakyma),
    enabled: haku.trim().length > 0,
    throwOnError: false,
  });
