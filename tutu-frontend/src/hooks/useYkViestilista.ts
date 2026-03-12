import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { YhteisenKasittelynViesti } from '@/src/lib/types/yhteisenKasittelynViesti';

export const getYkViestilista = async (): Promise<
  YhteisenKasittelynViesti[]
> => {
  const localStorageSearchParams = localStorage.getItem('tutu-query-string');
  const url = localStorageSearchParams
    ? `ykviestilista?${localStorageSearchParams}`
    : `ykviestilista?sort?saapumisPvm:desc`;

  return await doApiFetch(url, undefined, 'no-store');
};

export const useYkViestilista = () =>
  useQuery({
    queryKey: ['getYkViestilista'],
    queryFn: getYkViestilista,
    refetchOnMount: 'always',
    throwOnError: false,
  });
