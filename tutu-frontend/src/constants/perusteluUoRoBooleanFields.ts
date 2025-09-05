import { PerusteluUoRoSisalto } from '@/src/lib/types/perusteluUoRo';

export const opettajatBooleanFields: {
  key: keyof PerusteluUoRoSisalto;
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
  key: keyof PerusteluUoRoSisalto;
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
  key: keyof PerusteluUoRoSisalto;
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

export const sovellettuBooleanFields: {
  key: keyof PerusteluUoRoSisalto;
  labelKey: string;
}[] = [
  {
    key: 'sovellettuOpettajanPedagogisetOpinnot',
    labelKey: 'hakemus.perustelu.uoro.sovellettu.opettajanPedagogisetOpinnot',
  },
  {
    key: 'sovellettuOpetettavanAineenOpinnot',
    labelKey: 'hakemus.perustelu.uoro.sovellettu.opetettavanAineenOpinnot',
  },
  {
    key: 'sovellettuMonialaisetOpinnot',
    labelKey: 'hakemus.perustelu.uoro.sovellettu.monialaisetOpinnot',
  },
  {
    key: 'sovellettuErityisopetus',
    labelKey: 'hakemus.perustelu.uoro.sovellettu.erityisopetus',
  },
  {
    key: 'sovellettuVarhaiskasvatus',
    labelKey: 'hakemus.perustelu.uoro.sovellettu.varhaiskasvatus',
  },
  {
    key: 'sovellettuRinnastaminenKasvatustieteelliseenTutkintoon',
    labelKey:
      'hakemus.perustelu.uoro.sovellettu.rinnastaminenKasvatustieteelliseenTutkintoon',
  },
  {
    key: 'sovellettuRiittavatOpinnot',
    labelKey: 'hakemus.perustelu.uoro.sovellettu.riittavatOpinnot',
  },
  {
    key: 'sovellettuRinnastaminenOtmTutkintoon',
    labelKey: 'hakemus.perustelu.uoro.sovellettu.rinnastaminenOtmTutkintoon',
  },
  {
    key: 'sovellettuLuokanopettaja',
    labelKey: 'hakemus.perustelu.uoro.sovellettu.luokanopettaja',
  },
  {
    key: 'sovellettuMuuTilanne',
    labelKey: 'hakemus.perustelu.uoro.muuTilanne',
  },
];
