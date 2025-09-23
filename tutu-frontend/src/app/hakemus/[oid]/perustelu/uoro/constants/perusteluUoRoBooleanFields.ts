import { UoRoSisalto } from '@/src/lib/types/perusteluUoRo';
import {
  sovellettuErityisOpetusOptions,
  sovellettuLuokanOpettajaOptions,
  sovellettuMonialaisetOpinnotOptions,
  sovellettuPedagogisetOpinnotOptions,
  sovellettuRinnastaminenKasvatustieteelliseenTutkintoon,
  sovellettuRinnastaminenOikeustieteenMaisterinTutkintoon,
  sovellettuVarhaiskasvatusOptions,
} from '@/src/app/hakemus/[oid]/perustelu/uoro/constants/SovellettuTilanneOptions';
import { OphRadioOption } from '@/src/lib/types/common';

export const opettajatBooleanFields: {
  key: keyof UoRoSisalto;
  labelKey: string;
}[] = [
  {
    key: 'opettajatEroMonialaisetOpinnotSisalto',
    labelKey: 'hakemus.perustelu.uoro.opettajat.monialaisetOpinnotSisalto',
  },
  {
    key: 'opettajatEroMonialaisetOpinnotLaajuus',
    labelKey: 'hakemus.perustelu.uoro.opettajat.monialaisetOpinnotLaajuus',
  },
  {
    key: 'opettajatEroPedagogisetOpinnotSisalto',
    labelKey: 'hakemus.perustelu.uoro.opettajat.pedagogisetOpinnotSisalto',
  },
  {
    key: 'opettajatEroPedagogisetOpinnotLaajuus',
    labelKey: 'hakemus.perustelu.uoro.opettajat.pedagogisetOpinnotLaajuus',
  },
  {
    key: 'opettajatEroKasvatustieteellisetOpinnotSisalto',
    labelKey:
      'hakemus.perustelu.uoro.opettajat.kasvatustieteellisetOpinnotSisalto',
  },
  {
    key: 'opettajatEroKasvatustieteellisetOpinnotVaativuus',
    labelKey:
      'hakemus.perustelu.uoro.opettajat.kasvatustieteellisetOpinnotVaativuus',
  },
  {
    key: 'opettajatEroKasvatustieteellisetOpinnotLaajuus',
    labelKey:
      'hakemus.perustelu.uoro.opettajat.kasvatustieteellisetOpinnotLaajuus',
  },
  {
    key: 'opettajatEroOpetettavatAineetOpinnotSisalto',
    labelKey:
      'hakemus.perustelu.uoro.opettajat.opetettavatAineetOpinnotSisalto',
  },
  {
    key: 'opettajatEroOpetettavatAineetOpinnotVaativuus',
    labelKey:
      'hakemus.perustelu.uoro.opettajat.opetettavatAineetOpinnotVaativuus',
  },
  {
    key: 'opettajatEroOpetettavatAineetOpinnotLaajuus',
    labelKey:
      'hakemus.perustelu.uoro.opettajat.opetettavatAineetOpinnotLaajuus',
  },
  {
    key: 'opettajatEroErityisopettajanOpinnotSisalto',
    labelKey: 'hakemus.perustelu.uoro.opettajat.erityisopettajanOpinnotSisalto',
  },
  {
    key: 'opettajatEroErityisopettajanOpinnotLaajuus',
    labelKey: 'hakemus.perustelu.uoro.opettajat.erityisopettajanOpinnotLaajuus',
  },
  {
    key: 'opettajatMuuEro',
    labelKey: 'hakemus.perustelu.uoro.muuEro',
  },
];

export const vkBooleanFields: {
  key: keyof UoRoSisalto;
  labelKey: string;
}[] = [
  {
    key: 'vkOpettajatEroKasvatustieteellisetOpinnotSisalto',
    labelKey:
      'hakemus.perustelu.uoro.opettajatVk.kasvatustieteellisetOpinnotSisalto',
  },
  {
    key: 'vkOpettajatEroKasvatustieteellisetOpinnotLaajuus',
    labelKey:
      'hakemus.perustelu.uoro.opettajatVk.kasvatustieteellisetOpinnotLaajuus',
  },
  {
    key: 'vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotSisalto',
    labelKey:
      'hakemus.perustelu.uoro.opettajatVk.varhaiskasvatusEsiopetusOpinnotSisalto',
  },
  {
    key: 'vkOpettajatEroVarhaiskasvatusEsiopetusOpinnotLaajuus',
    labelKey:
      'hakemus.perustelu.uoro.opettajatVk.varhaiskasvatusEsiopetusOpinnotLaajuus',
  },
  {
    key: 'vkOpettajatMuuEro',
    labelKey: 'hakemus.perustelu.uoro.muuEro',
  },
];

export const otmBooleanFields: {
  key: keyof UoRoSisalto;
  labelKey: string;
}[] = [
  {
    key: 'otmEroOpinnotSisalto',
    labelKey: 'hakemus.perustelu.uoro.otm.opinnotSisalto',
  },
  {
    key: 'otmEroOpinnotVaativuus',
    labelKey: 'hakemus.perustelu.uoro.otm.opinnotVaativuus',
  },
  {
    key: 'otmEroOpinnotLaajuus',
    labelKey: 'hakemus.perustelu.uoro.otm.opinnotLaajuus',
  },
  { key: 'otmMuuEro', labelKey: 'hakemus.perustelu.uoro.muuEro' },
];

export const sovellettuTilanneBooleanFields: {
  type:
    | 'boolean'
    | 'sovellettuTilanne'
    | 'sovellettuTilanneOpetettavatAineet'
    | 'sovellettuTilanneKasvatustieteellinen';
  key: keyof UoRoSisalto;
  labelKey: string;
  options?:
    | OphRadioOption<string>[]
    | OphRadioOption<string>[][]
    | Record<string, OphRadioOption<string>[]>
    | undefined;
}[] = [
  {
    type: 'sovellettuTilanne',
    key: 'sovellettuOpettajanPedagogisetOpinnot',
    labelKey:
      'hakemus.perustelu.uoro.sovellettuTilanne.opettajanPedagogisetOpinnot',
    options: sovellettuPedagogisetOpinnotOptions,
  },
  {
    type: 'sovellettuTilanneOpetettavatAineet',
    key: 'sovellettuOpetettavanAineenOpinnot',
    labelKey:
      'hakemus.perustelu.uoro.sovellettuTilanne.opetettavanAineenOpinnot',
  },
  {
    type: 'sovellettuTilanne',
    key: 'sovellettuMonialaisetOpinnot',
    labelKey: 'hakemus.perustelu.uoro.sovellettuTilanne.monialaisetOpinnot',
    options: sovellettuMonialaisetOpinnotOptions,
  },
  {
    type: 'sovellettuTilanne',
    key: 'sovellettuErityisopetus',
    labelKey: 'hakemus.perustelu.uoro.sovellettuTilanne.erityisopetus',
    options: sovellettuErityisOpetusOptions,
  },
  {
    type: 'sovellettuTilanne',
    key: 'sovellettuVarhaiskasvatus',
    labelKey: 'hakemus.perustelu.uoro.sovellettuTilanne.varhaiskasvatus',
    options: sovellettuVarhaiskasvatusOptions,
  },
  {
    type: 'sovellettuTilanneKasvatustieteellinen',
    key: 'sovellettuRinnastaminenKasvatustieteelliseenTutkintoon',
    labelKey:
      'hakemus.perustelu.uoro.sovellettuTilanne.rinnastaminenKasvatustieteelliseenTutkintoon',
    options: sovellettuRinnastaminenKasvatustieteelliseenTutkintoon,
  },
  {
    type: 'sovellettuTilanne',
    key: 'sovellettuRiittavatOpinnot',
    labelKey: 'hakemus.perustelu.uoro.sovellettuTilanne.riittavatOpinnot',
  },
  {
    type: 'sovellettuTilanne',
    key: 'sovellettuRinnastaminenOtmTutkintoon',
    labelKey:
      'hakemus.perustelu.uoro.sovellettuTilanne.rinnastaminenOtmTutkintoon',

    options: sovellettuRinnastaminenOikeustieteenMaisterinTutkintoon,
  },
  {
    type: 'sovellettuTilanne',
    key: 'sovellettuLuokanopettaja',
    labelKey: 'hakemus.perustelu.uoro.sovellettuTilanne.luokanopettaja',
    options: sovellettuLuokanOpettajaOptions,
  },
  {
    type: 'boolean',
    key: 'sovellettuMuuTilanne',
    labelKey: 'hakemus.perustelu.uoro.muuEro',
  },
];
