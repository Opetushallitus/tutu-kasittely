import { Hakemus } from '@/lib/types/hakemus';
import { doApiFetch } from '@/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';

export const getHakemukset = async (): Promise<Hakemus[]> => {
  return await doApiFetch('hakemuslista', undefined, 'no-store');
};

export const useHakemukset = () =>
  useQuery({
    queryKey: ['getHakemukset'],
    queryFn: getHakemukset,
    staleTime: Infinity,
  });
