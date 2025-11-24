import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  AmmattikokemusJaElinikainenOppiminen,
  ErotAineenopettajanKoulutuksessa,
  KelpoisuuskoeSisalto,
  KorvaavaToimenpide,
  Paatostyyppi,
} from '@/src/lib/types/paatos';
import { Tutkinto } from '@/src/lib/types/hakemus';

export const ratkaisutyyppiOptions = (t: TFunction) => [
  { value: 'Paatos', label: t('hakemus.paatos.ratkaisutyyppi.paatos') },
  {
    value: 'PeruutusTaiRaukeaminen',
    label: t('hakemus.paatos.ratkaisutyyppi.peruutusTaiRaukeaminen'),
  },
  { value: 'Oikaisu', label: t('hakemus.paatos.ratkaisutyyppi.oikaisu') },
  {
    value: 'JatetaanTutkimatta',
    label: t('hakemus.paatos.ratkaisutyyppi.jatetaanTutkimatta'),
  },
  { value: 'Siirto', label: t('hakemus.paatos.ratkaisutyyppi.siirto') },
];

export const paatostyyppiOptions = (t: TFunction) => [
  { value: 'Taso', label: t('hakemus.paatos.paatostyyppi.options.taso') },
  {
    value: 'Kelpoisuus',
    label: t('hakemus.paatos.paatostyyppi.options.kelpoisuus'),
  },
  {
    value: 'TiettyTutkintoTaiOpinnot',
    label: t('hakemus.paatos.paatostyyppi.options.tiettyTutkintoTaiOpinnot'),
  },
  {
    value: 'RiittavatOpinnot',
    label: t('hakemus.paatos.paatostyyppi.options.riittavatOpinnot'),
  },
];

export const sovellettuLakiOptions = (
  paatosTyyppi: Paatostyyppi,
  t: TFunction,
) => {
  switch (paatosTyyppi) {
    case 'Taso':
    case 'TiettyTutkintoTaiOpinnot':
      return [
        {
          value: 'uo',
          label: t('hakemus.paatos.sovellettuLaki.uo'),
        },
      ];
    case 'Kelpoisuus':
      return [
        {
          value: 'ap',
          label: t('hakemus.paatos.sovellettuLaki.ap'),
        },
        {
          value: 'ap_seut',
          label: t('hakemus.paatos.sovellettuLaki.ap_seut'),
        },
        {
          value: 'uo',
          label: t('hakemus.paatos.sovellettuLaki.uo'),
        },
      ];
    case 'RiittavatOpinnot':
      return [
        {
          value: 'ro',
          label: t('hakemus.paatos.sovellettuLaki.ro'),
        },
      ];
    default:
      return [];
  }
};

export const tutkintoOptions = (t: TFunction, tutkinnot: Tutkinto[]) => {
  return (
    tutkinnot.map((tutkinto) => ({
      label:
        tutkinto.jarjestys === 'MUU'
          ? t('hakemus.paatos.tutkinto.muuTutkinto')
          : tutkinto.nimi!,
      value: tutkinto.id!,
    })) || []
  );
};

export const myonteinenPaatosOptions = (t: TFunction) => [
  { value: 'true', label: t('hakemus.paatos.myonteinen') },
  { value: 'false', label: t('hakemus.paatos.kielteinen') },
];

export const tutkinnonTasoOptions = (t: TFunction) => [
  {
    value: 'AlempiKorkeakoulu',
    label: t('hakemus.paatos.tutkinto.alempiKorkeakoulu'),
  },
  {
    value: 'YlempiKorkeakoulu',
    label: t('hakemus.paatos.tutkinto.ylempiKorkeakoulu'),
  },
];

export const direktiivitasoOptions = (t: TFunction) => [
  {
    value: 'a_1384_2015_patevyystaso_1',
    label: t('hakemus.paatos.direktiivitaso.a_1384_2015_patevyystaso_1'),
  },
  {
    value: 'b_1384_2015_patevyystaso_2',
    label: t('hakemus.paatos.direktiivitaso.b_1384_2015_patevyystaso_2'),
  },
  {
    value: 'c_1384_2015_patevyystaso_3',
    label: t('hakemus.paatos.direktiivitaso.c_1384_2015_patevyystaso_3'),
  },
  {
    value: 'd_1384_2015_patevyystaso_4',
    label: t('hakemus.paatos.direktiivitaso.d_1384_2015_patevyystaso_4'),
  },
  {
    value: 'e_1384_2015_patevyystaso_5',
    label: t('hakemus.paatos.direktiivitaso.e_1384_2015_patevyystaso_5'),
  },
];

export const olennaisiaErojaOptions = (t: TFunction) => [
  { value: 'true', label: t('yleiset.kylla') },
  { value: 'false', label: t('yleiset.ei') },
];

export const ammattikokemusElinikainenOppiminenKorvaavuusOptions = (
  t: TFunction,
) => [
  {
    value: 'Taysi',
    label: t(
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.ammattikokemusElinikainenOppiminen.korvaavuus.taysi',
    ),
  },
  {
    value: 'Osittainen',
    label: t(
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.ammattikokemusElinikainenOppiminen.korvaavuus.osittainen',
    ),
  },
  {
    value: 'Ei',
    label: t(
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.ammattikokemusElinikainenOppiminen.korvaavuus.ei',
    ),
  },
];

export const erotKoulutuksessaAineenopettajaFields = [
  'eroOpetettavanAineenOpinnoissa',
  'eroPedagogisissaOpinnoissa',
  'syventavienOpintojenPuuttuminen',
  'eriIkaryhma',
  'muu',
] as const satisfies (keyof ErotAineenopettajanKoulutuksessa)[];

export const emptyErotKoulutuksessaAineenopettaja =
  (): ErotAineenopettajanKoulutuksessa =>
    erotKoulutuksessaAineenopettajaFields.reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as ErotAineenopettajanKoulutuksessa);

export const korvaavaToimenpideOptions = [
  'kelpoisuuskoe',
  'sopeutumisaika',
  'kelpoisuuskoeJaSopeutumisaika',
] as const satisfies (keyof KorvaavaToimenpide)[];

export const emptyKorvaavaToimenpide = (): KorvaavaToimenpide =>
  korvaavaToimenpideOptions.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as KorvaavaToimenpide);

export const korvaavaToimenpideOptionsUO = [
  'taydentavatOpinnot',
  'kelpoisuuskoe',
  'sopeutumisaika',
] as const satisfies (keyof KorvaavaToimenpide)[];

export const emptyKorvaavaToimenpideUO = (): KorvaavaToimenpide =>
  korvaavaToimenpideOptionsUO.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as KorvaavaToimenpide);

export const kelpoisuuskoeFields = [
  'aihealue1',
  'aihealue2',
  'aihealue3',
] as const satisfies (keyof KelpoisuuskoeSisalto)[];

export const emptyKelpoisuuskoeSisalto = (): KelpoisuuskoeSisalto =>
  kelpoisuuskoeFields.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as KelpoisuuskoeSisalto);

export const ammattikokemusJaElinikainenOppiminenOptions = [
  'ammattikokemus',
  'elinikainenOppiminen',
] as const satisfies (keyof AmmattikokemusJaElinikainenOppiminen)[];

export const emptyAmmattikokemusJaElinikainenOppiminen =
  (): AmmattikokemusJaElinikainenOppiminen =>
    ammattikokemusJaElinikainenOppiminenOptions.reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as AmmattikokemusJaElinikainenOppiminen);
