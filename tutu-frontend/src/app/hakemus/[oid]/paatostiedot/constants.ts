import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  AmmattikokemusJaElinikainenOppiminen,
  KelpoisuuskoeSisalto,
  KorvaavaToimenpide,
  Paatostyyppi,
} from '@/src/lib/types/paatos';
import { Tutkinto } from '@/src/lib/types/tutkinto';

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
  {
    value: 'Taso',
    label: `1 ${t('hakemus.paatos.paatostyyppi.options.taso')}`,
  },
  {
    value: 'Kelpoisuus',
    label: `2 ${t('hakemus.paatos.paatostyyppi.options.kelpoisuus')}`,
  },
  {
    value: 'TiettyTutkintoTaiOpinnot',
    label: `3 ${t('hakemus.paatos.paatostyyppi.options.tiettyTutkintoTaiOpinnot')}`,
  },
  {
    value: 'RiittavatOpinnot',
    label: `4 ${t('hakemus.paatos.paatostyyppi.options.riittavatOpinnot')}`,
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
    case 'LopullinenPaatos':
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

export const yleinenKoulutusEroTranslationKeys = {
  eriIkaryhma:
    'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.yleiset.eriIkaryhma',
};

export type KoulutusEroModel = {
  id: string;
  kelpoisuusKey?: string;
  lyhytNimiKaannosAvain?: string;
  kelpoisuusKohtainenEroLkm: number;
  yleisetErot: string[];
  sisaltaaMuuEro: boolean;
};

export const erotKoulutuksessaOptions: KoulutusEroModel[] = [
  //////////////////
  // Opetusala

  {
    id: 'aineenopetus',
    kelpoisuusKey: 'Opetusalan ammatit_Aineenopettaja perusopetuksessa',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.aineenopetus.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 3,
    yleisetErot: ['eriIkaryhma'],
    sisaltaaMuuEro: true,
  },
  {
    id: 'aineenopetusLukio',
    kelpoisuusKey: 'Opetusalan ammatit_Aineenopettaja lukiossa',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.aineenopetusLukio.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 3,
    yleisetErot: ['eriIkaryhma'],
    sisaltaaMuuEro: true,
  },
  {
    id: 'esiopettaja',
    kelpoisuusKey: 'Opetusalan ammatit_Esiopetusta antava opettaja',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.esiopettaja.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 1,
    yleisetErot: ['eriIkaryhma'],
    sisaltaaMuuEro: true,
  },
  {
    id: 'luokanopettaja',
    kelpoisuusKey: 'Opetusalan ammatit_Luokanopettaja',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.luokanopettaja.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'ap-ip_ohjaaja',
    kelpoisuusKey: 'Opetusalan ammatit_Aamu- ja iltapäivätoiminnan ohjaaja',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.ap-ip_ohjaaja.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'erityisluokanopettaja',
    kelpoisuusKey: 'Opetusalan ammatit_Erityisluokanopettaja',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.erityisluokanopettaja.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'erityisopettajaPerusopetuksessa',
    kelpoisuusKey: 'Opetusalan ammatit_Erityisopettaja perusopetuksessa',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.erityisopettajaPerusopetuksessa.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'erityisopettajaLukiossa',
    kelpoisuusKey: 'Opetusalan ammatit_Erityisopettaja lukiossa',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.erityisopettajaLukiossa.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'erityisopettajaMuu',
    kelpoisuusKey: 'Opetusalan ammatit_Muu erityisopettaja',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.erityisopettajaMuu.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'oppilaanohjaajaPerusopetuksessa',
    kelpoisuusKey: 'Opetusalan ammatit_Oppilaanohjaaja perusopetuksessa',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.oppilaanohjaajaPerusopetuksessa.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'opintoohjaajaLukiossa',
    kelpoisuusKey: 'Opetusalan ammatit_Opinto-ohjaaja lukiossa',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.opintoohjaajaLukiossa.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'ammattikoulunOpettajaAmmattiosat',
    kelpoisuusKey:
      'Opetusalan ammatit_Ammatillisten tutkinnon osien opettaja ammatillisessa koulutuksessa',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.ammattikoulunOpettajaAmmattiosat.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'ammattikoulunOpettajaYhteiset',
    kelpoisuusKey:
      'Opetusalan ammatit_Yhteisten tutkinnon osien opettaja ammatillisessa koulutuksessa ',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.ammattikoulunOpettajaYhteiset.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'vapaanSivistystyonOpettaja',
    kelpoisuusKey: 'Opetusalan ammatit_Vapaan sivistystyön opettaja',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.vapaanSivistystyonOpettaja.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'kuraattori',
    kelpoisuusKey: 'Opetusalan ammatit_Kuraattori',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.kuraattori.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },

  //////////////////
  // Varhaiskasvatus

  {
    id: 'varhaiskasvatuksenOpettaja',
    kelpoisuusKey: 'Varhaiskasvatuksen tehtävät_Varhaiskasvatuksen opettaja',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.varhaiskasvatuksenOpettaja.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 2,
    yleisetErot: ['eriIkaryhma'],
    sisaltaaMuuEro: true,
  },
  {
    id: 'varhaiskasvatuksenSosionomi',
    kelpoisuusKey: 'Varhaiskasvatuksen tehtävät_Varhaiskasvatuksen sosionomi',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.varhaiskasvatuksenSosionomi.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'varhaiskasvatuksenLastenhoitaja',
    kelpoisuusKey:
      'Varhaiskasvatuksen tehtävät_Varhaiskasvatuksen lastenhoitaja',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.varhaiskasvatuksenLastenhoitaja.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 2,
    yleisetErot: ['eriIkaryhma'],
    sisaltaaMuuEro: true,
  },
  {
    id: 'varhaiskasvatuksenErityisopettaja',
    kelpoisuusKey:
      'Varhaiskasvatuksen tehtävät_Varhaiskasvatuksen erityisopettaja',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.varhaiskasvatuksenErityisopettaja.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
  {
    id: 'varhaiskasvatuksenMuu',
    kelpoisuusKey: 'Varhaiskasvatuksen tehtävät_Muu varhaiskasvatuksen tehtävä',
    lyhytNimiKaannosAvain:
      'hakemus.paatos.paatostyyppi.kelpoisuus.paatos.erotKoulutuksessa.varhaiskasvatuksenMuu.lyhytNimi',
    kelpoisuusKohtainenEroLkm: 4,
    yleisetErot: [],
    sisaltaaMuuEro: true,
  },
];

export const oletusKoulutusErot: KoulutusEroModel = {
  id: 'oletus',
  kelpoisuusKohtainenEroLkm: 5,
  yleisetErot: [],
  sisaltaaMuuEro: true,
};

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
