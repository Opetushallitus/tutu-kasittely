import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import {
  ViestipohjaListItem,
  ViestipohjaKategoria,
} from '@/src/lib/types/viesti';

const getViestipohjaLista = async (): Promise<Array<ViestipohjaListItem>> => {
  const url = `viestipohja`;
  return await doApiFetch(url, undefined, 'no-store');
};

const getViestipohjaKategoriat = async (): Promise<
  Array<ViestipohjaKategoria>
> => {
  const url = `viestipohja/kategoria`;
  return await doApiFetch(url, undefined, 'no-store');
};

const putViestipohjaKategoria = async (
  viestipohjaKategoria: ViestipohjaKategoria,
) => {
  const url = `viestipohja/kategoria`;
  return await doApiPut(url, viestipohjaKategoria);
};

export const viestipohjaListaQueryKey = ['viestipohjat'];

export const useViestipohjat = () => {
  const viestipohjaKategoriaQueryKey = ['viestipohjaKategoriat'];
  const queryClient = useQueryClient();
  const { addToast } = useToaster();
  const { t } = useTranslations();

  const {
    data: kategoriat,
    error: kategoriatError,
    isLoading: kategoriatLoading,
  } = useQuery({
    queryKey: viestipohjaKategoriaQueryKey,
    queryFn: () => getViestipohjaKategoriat(),
    throwOnError: false,
  });

  const viestipohjaQuery = useQuery({
    queryKey: viestipohjaListaQueryKey,
    queryFn: () => getViestipohjaLista(),
    throwOnError: false,
  });

  const {
    mutate: tallennaKategoriaMutation,
    error: tallennaKategoriaError,
    isPending: tallennaKategoriaPending,
    isSuccess: tallennaKategoriaSuccess,
    reset: tallennaKategoriaReset,
  } = useMutation({
    mutationFn: putViestipohjaKategoria,
    onSuccess: async (response, variables) => {
      const data = (await response.json()) as ViestipohjaKategoria;
      const oldKategoriat = kategoriat ?? [];
      const newKategoriat = variables.id
        ? oldKategoriat.map((kategoria) => {
            if (kategoria.id === data.id) {
              return data;
            }
            return kategoria;
          })
        : [...(kategoriat ?? []), data];

      await queryClient.setQueryData(
        viestipohjaKategoriaQueryKey,
        newKategoriat,
      );

      addToast({
        key: 'viestipohjat.kategoriat.tallenna.toast',
        message: t('viestipohjat.kategoriat.tallennusOnnistui'),
        type: 'success',
      });
    },
  });

  const tallennaKategoria = (viestipohjaKategoria: ViestipohjaKategoria) => {
    tallennaKategoriaReset();
    tallennaKategoriaMutation(viestipohjaKategoria);
  };

  return {
    viestipohjat: viestipohjaQuery.data,
    kategoriat,
    viestipohjatLoading: viestipohjaQuery.isLoading,
    viestipohjatError: viestipohjaQuery.error,
    kategoriatLoading,
    kategoriatError,
    tallennaKategoria,
    tallennaKategoriaError,
    tallennaKategoriaPending,
    tallennaKategoriaSuccess,
  };
};
