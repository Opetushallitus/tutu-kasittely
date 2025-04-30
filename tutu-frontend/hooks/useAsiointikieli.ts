import { useQuery } from '@tanstack/react-query';
import { fetchAsiointikieli } from '@/lib/data';
import { Language } from '@/lib/localization/localization-types';

export const getAsiointiKieli = async (): Promise<Language> => {
  const data = await fetchAsiointikieli();
  return data ?? 'fi';
};

export const useAsiointiKieli = () =>
  useQuery({
    queryKey: ['getAsiointiKieli'],
    queryFn: getAsiointiKieli,

    staleTime: Infinity,
  });
