import { useQuery } from '@tanstack/react-query';
import { Hakemus } from '@/src/lib/types/hakemus';

export const getHakemukset = async (): Promise<Hakemus[]> => {
  return [
    {
      hakemusOid: '1.2.246.562.11.00000000001',
      asiatunnus: 'OPH-123-1111',
      aika: '2 kk',
      hakija: 'Harri Hakija',
      paatostyyppi: 'AP',
      vaihe: 'Käsittelyssä',
    },
    {
      hakemusOid: '1.2.246.562.11.00000000002',
      asiatunnus: 'OPH-123-2222',
      aika: '2 kk',
      hakija: 'Harri Hakija',
      paatostyyppi: 'AP',
      vaihe: 'Käsittelyssä',
    },
    {
      hakemusOid: '1.2.246.562.11.00000000003',
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
