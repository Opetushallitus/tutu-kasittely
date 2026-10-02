import _paatos from './_paatos.json';
import paatosTietoOptions from './paatosTietoOptions.json';

import {
  emptyKielteisenPaatoksenPerustelut,
  emptyPeruutuksenTaiRaukeamisenSyy,
} from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { Paatos } from '@/src/lib/types/paatos';

export const getPaatos = (): Paatos => {
  return {
    ..._paatos,
    ratkaisutyyppi: 'Paatos',
    peruutuksenTaiRaukeamisenSyy: emptyPeruutuksenTaiRaukeamisenSyy(),
    paatosTiedot: [],
    paatosTietoOptions: paatosTietoOptions,
    hyvaksymispaiva: null,
    lahetyspaiva: null,
    paatostekstiVahvistettu: null,
    muokattu: '2024-06-01T12:00:00Z',
    muokkaaja: 'Tutu',
  };
};

export const getPaatosWithPaatosTiedot = (): Paatos => {
  return {
    ..._paatos,
    ratkaisutyyppi: 'Paatos',
    peruutuksenTaiRaukeamisenSyy: emptyPeruutuksenTaiRaukeamisenSyy(),
    paatosTiedot: [
      {
        id: 'adefawdf-adw3-6354-7452-012awdwad340',
        paatosId: '6befe3df-eac4-4097-9757-031faafeb950',
        paatosTyyppi: 'Taso',
        sovellettuLaki: 'uo',
        lisaaTutkintoPaatostekstiin: true,
        myonteinenPaatos: true,
        tutkintoTaso: 'AlempiKorkeakoulu',
        kielteisenPaatoksenPerustelut: emptyKielteisenPaatoksenPerustelut(),
        rinnastettavatTutkinnotTaiOpinnot: [],
        kelpoisuudet: [],
      },
    ],
    paatosTietoOptions: paatosTietoOptions,
    hyvaksymispaiva: null,
    lahetyspaiva: null,
    paatostekstiVahvistettu: null,
    muokattu: '2024-06-01T12:00:00Z',
    muokkaaja: 'Tutu',
  };
};
