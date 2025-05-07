import { useQuery } from '@tanstack/react-query';
import { Hakemus } from '@/lib/types/hakemus';

export const getHakemukset = async (): Promise<Hakemus[]> => {
  return [
    {
      asiatunnus: 'OPH-123-1111',
      aika: '2 kk',
      hakija: 'Harri Hakija',
      paatostyyppi: 'AP',
      vaihe: 'Käsittelyssä',
    },
    {
      asiatunnus: 'OPH-123-2222',
      aika: '2 kk',
      hakija: 'Harri Hakija',
      paatostyyppi: 'AP',
      vaihe: 'Käsittelyssä',
    },
    {
      asiatunnus: 'OPH-123-3333',
      aika: '2 kk',
      hakija: 'Harri Hakija',
      paatostyyppi: 'AP',
      vaihe: 'Käsittelyssä',
    },
  ];
};

export const useHakemukset = () =>
  useQuery({
    queryKey: ['getHakemukset'],
    queryFn: getHakemukset,

    staleTime: Infinity,
  });
