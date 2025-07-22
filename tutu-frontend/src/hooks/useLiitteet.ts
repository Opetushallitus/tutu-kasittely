import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';

export const getLiitteet = async (avaimet): Promise<Any[]> => {
  if (!avaimet || !avaimet.length) {
    return {};
  }

  const url = `liite/metadata?avaimet=${avaimet}`;

  return await doApiFetch(url, undefined, 'no-store');
};

export const useLiitteet = (avaimet) =>
  useQuery({
    queryKey: ['getLiitteet', avaimet],
    queryFn: () => getLiitteet(avaimet),
    staleTime: Infinity,
    throwOnError: false,
  });
