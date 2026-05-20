import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { doApiFetch, doApiPut } from '@/src/lib/tutu-backend/api';
import {
  PaatospohjaKategoria,
  PaatospohjaListItem,
} from '@/src/lib/types/paatosteksti';

const getPaatospohjaLista = async (): Promise<Array<PaatospohjaListItem>> => {
  const url = `paatospohja`;
  return await doApiFetch(url, undefined, 'no-store');
};

const getPaatospohjaKategoriat = async (): Promise<
  Array<PaatospohjaKategoria>
> => {
  const url = `paatospohja/kategoria`;
  return await doApiFetch(url, undefined, 'no-store');
};

const putPaatospohjaKategoria = async (
  paatospohjaKategoria: PaatospohjaKategoria,
) => {
  const url = `paatospohja/kategoria`;
  return await doApiPut(url, paatospohjaKategoria);
};

export const paatospohjaListaQueryKey = ['paatospohjat'];

export const usePaatospohjat = () => {
  const paatospohjaKategoriaQueryKey = ['paatospohjaKategoriat'];
  const queryClient = useQueryClient();
  const { addToast } = useToaster();
  const { t } = useTranslations();

  const {
    data: kategoriat,
    error: kategoriatError,
    isLoading: kategoriatLoading,
  } = useQuery({
    queryKey: paatospohjaKategoriaQueryKey,
    queryFn: () => getPaatospohjaKategoriat(),
    throwOnError: false,
  });

  const paatospohjaQuery = useQuery({
    queryKey: paatospohjaListaQueryKey,
    queryFn: () => getPaatospohjaLista(),
    throwOnError: false,
  });

  const {
    mutate: tallennaKategoriaMutation,
    error: tallennaKategoriaError,
    isPending: tallennaKategoriaPending,
    isSuccess: tallennaKategoriaSuccess,
    reset: tallennaKategoriaReset,
  } = useMutation({
    mutationFn: putPaatospohjaKategoria,
    onSuccess: async (response, variables) => {
      const data = (await response.json()) as PaatospohjaKategoria;
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
        paatospohjaKategoriaQueryKey,
        newKategoriat,
      );

      addToast({
        key: 'paatospohjat.kategoriat.tallenna.toast',
        message: t('tekstipohjat.paatospohjat.kategoriat.tallennusOnnistui'),
        type: 'success',
      });
    },
  });

  const tallennaKategoria = (paatospohjaKategoria: PaatospohjaKategoria) => {
    tallennaKategoriaReset();
    tallennaKategoriaMutation(paatospohjaKategoria);
  };

  return {
    paatospohjat: paatospohjaQuery.data,
    kategoriat,
    paatospohjatLoading: paatospohjaQuery.isLoading,
    paatospohjatError: paatospohjaQuery.error,
    kategoriatLoading,
    kategoriatError,
    tallennaKategoria,
    tallennaKategoriaError,
    tallennaKategoriaPending,
    tallennaKategoriaSuccess,
  };
};
