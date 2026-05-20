import {
  PaatospohjaKategoria,
  PaatospohjaListItem,
} from '@/src/lib/types/paatosteksti';

export const usePaatospohjat = () => {
  return {
    kategoriat: [{ id: '1', nimi: 'Kategoria' }] as PaatospohjaKategoria[],
    paatospohjat: [
      { id: '1', kategoriaId: '1', nimi: 'Päätöspohja' },
    ] as PaatospohjaListItem[],
    tallennaKategoria: (paatospohjaKategoria: PaatospohjaKategoria) => {
      console.log('tallennaKategoria', paatospohjaKategoria);
    },
  };
};
