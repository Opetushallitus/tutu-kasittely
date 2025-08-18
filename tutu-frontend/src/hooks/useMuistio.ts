'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Muistio } from '@/src/lib/types/muistio';
import { doApiFetch, doApiPost } from '@/src/lib/tutu-backend/api';

export const getMuistio = async (
  hakemusOid: string | undefined,
  hakemuksenOsa: string,
  sisainen: boolean,
): Promise<Muistio> => {
  const nakyvyys = sisainen ? 'sisainen' : 'julkinen';
  const url = `muistio/${hakemusOid}/${hakemuksenOsa}?nakyvyys=${nakyvyys}`;
  return await doApiFetch(url, undefined, 'no-store');
};

export const postMuistio = (
  hakemusOid: string | undefined,
  hakemuksenOsa: string,
  sisainen: boolean,
  sisalto: string,
) => {
  const nakyvyys = sisainen ? 'sisainen' : 'julkinen';
  const url = `muistio/${hakemusOid}/${hakemuksenOsa}`;
  const body = {
    nakyvyys,
    sisalto,
  };
  return doApiPost(url, body);
};

export const useMuistio = (
  hakemusOid: string | undefined,
  hakemuksenOsa: string,
  sisainen: boolean,
) => {
  const queryKey = ['muistio', hakemusOid, hakemuksenOsa, sisainen];

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: () => getMuistio(hakemusOid, hakemuksenOsa, sisainen),
    enabled: !!hakemusOid,
    throwOnError: false,
  });

  // Mutations
  const mutation = useMutation({
    mutationFn: (sisalto: string) =>
      postMuistio(hakemusOid, hakemuksenOsa, sisainen, sisalto),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMuistio = (sisalto: string) => {
    mutation.mutate(sisalto);
  };

  return { ...query, updateMuistio, muistio: query.data };
};
