import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';

export const getLiitteet = async (avain): Promise<Any[]> => {
  const url = `liite/metadata/${avain}`;

  return await doApiFetch(url, undefined, 'no-store');
};

export const useLiitteet = (avain) =>
  useQuery({
    queryKey: ['getLiitteet', avain],
    queryFn: () => getLiitteet(avain),
    staleTime: Infinity,
    throwOnError: false,
  });
