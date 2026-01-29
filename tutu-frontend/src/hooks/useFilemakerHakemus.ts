/* eslint-disable  @typescript-eslint/no-explicit-any */

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';

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
