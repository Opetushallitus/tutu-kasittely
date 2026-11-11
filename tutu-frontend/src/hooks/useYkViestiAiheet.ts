import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { YkViestiAihe } from '@/src/lib/types/yhteinenkasittely';

const getYhteinenKasittelyAiheet = async (): Promise<YkViestiAihe[]> => {
  return doApiFetch('ykViestiAiheet', {}, 'no-store');
};

export const useYkViestiAiheet = () => {
  const aihteetQuery = useQuery({
    queryKey: ['getYkViestiAiheet'],
    queryFn: getYhteinenKasittelyAiheet,
    refetchOnMount: 'always',
    throwOnError: false,
  });

  return {
    aiheet: aihteetQuery.data || [],
    aiheetIsLoading: aihteetQuery.isLoading,
    aiheetError: aihteetQuery.isError,
  };
};
