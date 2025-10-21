import _paatos from './_paatos.json';
import paatosTietoOptions from './paatosTietoOptions.json';
import { Paatos } from '@/src/lib/types/paatos';
export const getPaatos = (): Paatos => {
  return {
    ..._paatos,
    ratkaisutyyppi: 'Paatos',
    paatosTiedot: [],
    paatosTietoOptions: paatosTietoOptions,
    hyvaksymispaiva: null,
    lahetyspaiva: null,
  };
};
