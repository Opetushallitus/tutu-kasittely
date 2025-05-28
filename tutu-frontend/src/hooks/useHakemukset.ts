import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { useQuery } from '@tanstack/react-query';

export const getHakemukset = async (): Promise<HakemusListItem[]> => {
  const localStorageSearchParams = localStorage.getItem('tutu-query-string');
  return await doApiFetch(
    `hakemuslista?${localStorageSearchParams}`,
    undefined,
    'no-store',
  );
};

export const useHakemukset = () =>
  useQuery({
    queryKey: ['getHakemukset'],
    queryFn: getHakemukset,
    staleTime: Infinity,
  });
