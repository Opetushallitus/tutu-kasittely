import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { Paginated } from '@/src/lib/types/paginated';

export type HakemuksetFilters = {
  // Tutkinto
  suoritusmaa: string;
  paattymisVuosi: string;
  todistusVuosi: string;
  oppilaitos: string;
  tutkinnonNimi: string;
  paaAine: string;
  // Kelpoisuus
  kelpoisuus: string;
  opetettavatAineet: string;
  // Päätös
  ratkaisutyyppi: string;
  paatostyyppi: string;
  sovellettuLaki: string;
  tutkinnonTaso: string;
  kielteinen: string;
  myonteinen: string;
  // Hakija/esittelijä
  esittelijaOid: string;
  hakijanNimi: string;
  asiatunnus: string;
};

const getHakemuksetHaulla = async (
  haku: string,
  nakyma: string,
  page: number,
  filters: HakemuksetFilters,
): Promise<Paginated<HakemusListItem>> => {
  const params = new URLSearchParams({ haku, nakyma, page: String(page) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  return await doApiFetch(
    `hakemus/haku?${params.toString()}`,
    undefined,
    'no-store',
  );
};

export const useHakemuksetHaku = (
  haku: string,
  nakyma: string,
  page: number,
  filters: HakemuksetFilters,
) => {
  const enabled =
    haku.trim().length > 0 || Object.values(filters).some(Boolean);
  return useQuery({
    queryKey: ['getHakemuksetHaulla', haku, nakyma, page, filters],
    queryFn: () => getHakemuksetHaulla(haku, nakyma, page, filters),
    enabled,
    throwOnError: false,
  });
};
