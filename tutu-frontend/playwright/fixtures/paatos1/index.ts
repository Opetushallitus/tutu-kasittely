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

export const getPaatosWithPaatosTiedot = (): Paatos => {
  return {
    ..._paatos,
    ratkaisutyyppi: 'Paatos',
    paatosTiedot: [
      {
        paatosId: '6befe3df-eac4-4097-9757-031faafeb950',
        paatosTyyppi: 'Taso',
        sovellettuLaki: 'uo',
        lisaaTutkintoPaatostekstiin: true,
        myonteinenPaatos: true,
        tutkintoTaso: 'AlempiKorkeakoulu',
        rinnastettavatTutkinnotTaiOpinnot: [],
        kelpoisuudet: [],
        myonteisenPaatoksenLisavaatimukset: '',
      },
    ],
    paatosTietoOptions: paatosTietoOptions,
    hyvaksymispaiva: null,
    lahetyspaiva: null,
  };
};
