import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { MuuHakemus } from '@/src/lib/types/hakemus';

const getMuutHakemukset = async (
  hakemusOid?: string,
): Promise<Array<MuuHakemus>> => {
  return await doApiFetch(`hakemus/${hakemusOid}/muut/`, undefined, 'no-store');
};

export const useMuutHakemukset = (hakemusOid?: string) => {
  const queryKey = ['muut_hakemukset', hakemusOid];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getMuutHakemukset(hakemusOid),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  return {
    muutHakemukset: data,
    isLoading,
    error,
  };
};
