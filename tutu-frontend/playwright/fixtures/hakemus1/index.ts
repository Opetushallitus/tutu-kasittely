import _hakemus from './_hakemus.json';
import _sisalto from './_sisalto.json';
import _liitteet from './_liitteet.json';
import _liitteidenTilat from './_liitteidenTilat.json';
import _muutoshistoria from './_muutoshistoria.json';

import { clone } from 'remeda';
import { AsiakirjaPyynto } from '@/src/lib/types/hakemus';

export const getHakemus = () => {
  const hakemus = { ..._hakemus };
  const sisalto = [..._sisalto];
  const liitteidenTilat = [..._liitteidenTilat];
  const muutoshistoria = [..._muutoshistoria];
  const pyydettavatAsiakirjat = [] as AsiakirjaPyynto[];

  hakemus.sisalto = sisalto;
  hakemus.liitteidenTilat = liitteidenTilat;
  hakemus.muutoshistoria = muutoshistoria;
  hakemus.pyydettavatAsiakirjat = pyydettavatAsiakirjat;

  return hakemus;
};

export const getLiitteet = () => {
  const liitteet = clone(_liitteet);
  return liitteet;
};
