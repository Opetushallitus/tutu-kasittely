import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';

export const getHakemukset = async (): Promise<HakemusListItem[]> => {
  return await doApiFetch('hakemuslista', undefined, 'no-store');
};

export const useHakemukset = () =>
  useQuery({
    queryKey: ['getHakemukset'],
    queryFn: getHakemukset,
    staleTime: Infinity,
  });
