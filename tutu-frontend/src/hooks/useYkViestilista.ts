import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { YhteisenKasittelynViesti } from '@/src/lib/types/yhteisenKasittelynViesti';

export const getYkSentMessages = async (): Promise<
  YhteisenKasittelynViesti[]
> => {
  const localStorageSearchParams = localStorage.getItem('tutu-query-string');
  const url = localStorageSearchParams
    ? `ykLahetetytViestit?${localStorageSearchParams}`
    : `ykLahetetytViestit?sort?saapumisPvm:desc`;

  return await doApiFetch(url, undefined, 'no-store');
};

export const getYkReceivedMessages = async (): Promise<
  YhteisenKasittelynViesti[]
> => {
  const localStorageSearchParams = localStorage.getItem('tutu-query-string');
  const url = localStorageSearchParams
    ? `ykSaapuneetViestit?${localStorageSearchParams}`
    : `ykSaapuneetViestit?sort?saapumisPvm:desc`;

  return await doApiFetch(url, undefined, 'no-store');
};

export const useYkGetSentMessages = () =>
  useQuery({
    queryKey: ['getYkSentMessages'],
    queryFn: getYkSentMessages,
    refetchOnMount: 'always',
    throwOnError: false,
  });

export const useYkGetReceivedMessages = () =>
  useQuery({
    queryKey: ['getYkReceivedMessages'],
    queryFn: getYkReceivedMessages,
    refetchOnMount: 'always',
    throwOnError: false,
  });
