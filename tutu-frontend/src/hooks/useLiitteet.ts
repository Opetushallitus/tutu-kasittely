import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { AsiakirjaMetadata } from '@/src/lib/types/hakemus';

export const getLiitteet = async (
  hakemusOid: string,
  avaimet: string,
): Promise<AsiakirjaMetadata[]> => {
  if (!hakemusOid || !avaimet || !avaimet.length) {
    return [];
  }

  const url = `liite/metadata/${hakemusOid}?avaimet=${avaimet}`;

  return await doApiFetch(url, undefined, 'no-store');
};

export const useLiitteet = (hakemusOid: string, avaimet: string) =>
  useQuery({
    queryKey: ['getLiitteet', hakemusOid, avaimet],
    queryFn: () => getLiitteet(hakemusOid, avaimet),
    staleTime: Infinity,
    throwOnError: false,
  });
