/* eslint-disable  @typescript-eslint/no-explicit-any */

import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';

export const getFilemakerHakemus = async (id: string): Promise<any> => {
  const url = `vanha-tutu/${id}`;

  return await doApiFetch(url, undefined, 'no-store');
};

export const useFilemakerHakemus = (id: string) =>
  useQuery({
    queryKey: ['getFilemakerHakemus', id],
    queryFn: () => getFilemakerHakemus(id),
    enabled: !!id,
    throwOnError: false,
  });
