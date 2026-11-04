import { useQuery } from '@tanstack/react-query';

import { doApiFetch } from '@/src/lib/tutu-backend/api';
import { MuuHakemus } from '@/src/lib/types/hakemus';

const getMuutHakemukset = async (
  hakijaOid?: string,
): Promise<Array<MuuHakemus>> => {
  return await doApiFetch(`hakemus/muut/${hakijaOid}`, undefined, 'no-store');
};

export const useMuutHakemukset = (hakijaOid?: string) => {
  const queryKey = ['muut_hakemukset', hakijaOid];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getMuutHakemukset(hakijaOid),
    enabled: !!hakijaOid,
    throwOnError: false,
  });

  return {
    muutHakemukset: data,
    isLoading,
    error,
  };
};
