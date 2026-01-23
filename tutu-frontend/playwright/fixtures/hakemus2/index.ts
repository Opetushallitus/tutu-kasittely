import { _hakemus } from '@/playwright/fixtures/hakemus2/_hakemus';
import { _sisalto } from '@/playwright/fixtures/hakemus2/_sisalto';
import { Hakemus, SisaltoItem } from '@/src/lib/types/hakemus';

export const getLopullinenHakemus = () => {
  const hakemus: Hakemus = { ..._hakemus };
  const sisalto: Array<SisaltoItem> = [..._sisalto];

  hakemus.sisalto = sisalto;
  hakemus.liitteidenTilat = [];
  hakemus.muutosHistoria = [];
  hakemus.asiakirja.imiPyynto = {
    imiPyynto: null,
    imiPyyntoLahetetty: null,
    imiPyyntoNumero: null,
    imiPyyntoVastattu: null,
  };

  return hakemus as Hakemus;
};
