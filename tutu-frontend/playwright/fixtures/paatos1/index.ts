import _paatos from './_paatos.json';
import { Paatos } from '@/src/lib/types/paatos';
export const getPaatos = (): Paatos => {
  return { ..._paatos, ratkaisutyyppi: 'Paatos' };
};
