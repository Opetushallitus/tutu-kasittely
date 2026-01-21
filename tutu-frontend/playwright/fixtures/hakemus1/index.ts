import { _hakemus } from './_hakemus';
import { _sisalto } from './_sisalto';
import { _liitteet } from './_liitteet';
import { _liitteidenTilat } from './_liitteidenTilat';
import { _muutoshistoria } from './_muutoshistoria';
import { _asiakirjamallit } from './_asiakirjamallit';

import { clone } from 'remeda';
import {
  AsiakirjamallitTutkinnoista,
  Hakemus,
  HakemusKoskee,
  MuutosHistoriaItem,
  SisaltoItem,
} from '@/src/lib/types/hakemus';
import { LiiteItem } from '@/src/lib/types/liiteItem';

export const getHakemus = (hakemusKoskee?: HakemusKoskee) => {
  const hakemus: Hakemus = { ..._hakemus };
  hakemus.hakemusKoskee = hakemusKoskee ?? hakemus.hakemusKoskee;
  const sisalto: Array<SisaltoItem> = [..._sisalto];
  const liitteidenTilat = [..._liitteidenTilat];
  const muutoshistoria: Array<MuutosHistoriaItem> = [..._muutoshistoria];
  const asiakirjamallit: AsiakirjamallitTutkinnoista = { ..._asiakirjamallit };

  hakemus.sisalto = sisalto;
  hakemus.liitteidenTilat = liitteidenTilat;
  hakemus.muutosHistoria = muutoshistoria;
  hakemus.asiakirja.asiakirjamallitTutkinnoista = asiakirjamallit;
  hakemus.asiakirja.imiPyynto = {
    imiPyynto: null,
    imiPyyntoLahetetty: null,
    imiPyyntoNumero: null,
    imiPyyntoVastattu: null,
  };

  return hakemus as Hakemus;
};

export const getLiitteet = (): Array<LiiteItem> => {
  return clone(_liitteet);
};
