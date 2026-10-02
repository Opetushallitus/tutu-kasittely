import { SovellettuTilanneOption } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/SovellettuTilanneSelection';
import {
  ERITYISOPETUS_OPINNOT_KEY,
  KASVATUSTIETEEN_TUTKINTO_KEY,
  KoulutusEroModel,
  KoulutusEroTarkennukset,
  MONIALAISET_OPINNOT_KEY,
  OHJAUS_TEHTAVA_OPINNOT_KEY,
  OIKEUSTIETEEN_MAISTERI_KEY,
  OPETETTAVAN_AINEEN_OPINNOT_KEY,
  OPETTAJAN_PEDAGOGISET_OPINNOT_KEY,
  SOSIAALI_JA_TERVEYSALAN_TUTKINTO_KEY,
  VARHAISKASVATUS_JA_ESIOPETUS_VALMIUS_OPINNOT_KEY,
} from '@/src/app/hakemus/paatostiedot/constants';
import {
  emptyErotKoulutuksessaForModel,
  initOrUpdateErotKoulutuksessa,
  initOrUpdateKorvaavaToimenpide,
} from '@/src/app/hakemus/paatostiedot/paatostietoUtils';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  AmmattikokemuksenHuomioiminen,
  MyonteisenPaatoksenLisavaatimukset,
  OikeustieteenMaisteriLisavaatimukset,
  OikeustieteenSuomiOpintojenAihealue,
  SuomessaSuoritettujenOpintojenHuomioiminen,
} from '@/src/lib/types/paatos';

export enum ResolvedEntity {
  oikeustieteenMaisteri,
  opetettavaAine,
  opettajanPedagogisetOpinnot,
  erityisopetus,
  oppilasJaOpintoOhjaus,
  kasvatustieteellinenAla,
  sosiaaliJaTerveysAla,
  monialaisetOpinnot,
  ammatillisetValmiudet,
  muu,
}

export const KEYWORDS_BY_TUTKINTO_TAI_OPINTO = [
  {
    tutkintoTaiOpinto: ResolvedEntity.oikeustieteenMaisteri,
    keyword: OIKEUSTIETEEN_MAISTERI_KEY,
  },
  {
    tutkintoTaiOpinto: ResolvedEntity.opetettavaAine,
    keyword: OPETETTAVAN_AINEEN_OPINNOT_KEY,
  },
  {
    tutkintoTaiOpinto: ResolvedEntity.opettajanPedagogisetOpinnot,
    keyword: OPETTAJAN_PEDAGOGISET_OPINNOT_KEY,
  },
  {
    tutkintoTaiOpinto: ResolvedEntity.erityisopetus,
    keyword: ERITYISOPETUS_OPINNOT_KEY,
  },
  {
    tutkintoTaiOpinto: ResolvedEntity.oppilasJaOpintoOhjaus,
    keyword: OHJAUS_TEHTAVA_OPINNOT_KEY,
  },
  {
    tutkintoTaiOpinto: ResolvedEntity.kasvatustieteellinenAla,
    keyword: KASVATUSTIETEEN_TUTKINTO_KEY,
  },
  {
    tutkintoTaiOpinto: ResolvedEntity.sosiaaliJaTerveysAla,
    keyword: SOSIAALI_JA_TERVEYSALAN_TUTKINTO_KEY,
  },
  {
    tutkintoTaiOpinto: ResolvedEntity.monialaisetOpinnot,
    keyword: MONIALAISET_OPINNOT_KEY,
  },
  {
    tutkintoTaiOpinto: ResolvedEntity.ammatillisetValmiudet,
    keyword: VARHAISKASVATUS_JA_ESIOPETUS_VALMIUS_OPINNOT_KEY,
  },
  { tutkintoTaiOpinto: ResolvedEntity.muu, keyword: '' },
];

export const SOVELLETTU_TILANNE_BY_ENTITY: Record<
  ResolvedEntity,
  SovellettuTilanneOption[]
> = {
  [ResolvedEntity.oikeustieteenMaisteri]: [
    { value: '1' },
    { value: '1a' },
    { value: '1b' },
    { value: '2' },
    { value: '2a' },
    { value: '3' },
    { value: '4' },
    { value: '4a' },
    { value: 'muu', tKey: 'muuOikeustieteenMaisteri' },
  ],
  [ResolvedEntity.opetettavaAine]: [
    { value: 'aine1', tKey: 'aine', ordinal: '1' },
    { value: 'aine2', tKey: 'aine', ordinal: '2' },
    { value: 'aine3', tKey: 'aine', ordinal: '3' },
    { value: 'aine4', tKey: 'aine', ordinal: '4' },
    { value: 'aine5', tKey: 'aine', ordinal: '5' },
    { value: 'aine6', tKey: 'aine', ordinal: '6' },
  ],
  [ResolvedEntity.opettajanPedagogisetOpinnot]: [
    { value: 'pedagogiset1', tKey: 'pedagogiset', ordinal: '1' },
    { value: 'pedagogiset2', tKey: 'pedagogiset', ordinal: '2' },
    { value: 'pedagogiset3', tKey: 'pedagogiset', ordinal: '3' },
  ],
  [ResolvedEntity.erityisopetus]: [
    { value: 'erityisopetus1', tKey: 'erityisopetus', ordinal: '1' },
    { value: 'erityisopetus2', tKey: 'erityisopetus', ordinal: '2' },
    { value: 'erityisopetus3', tKey: 'erityisopetus', ordinal: '3' },
  ],
  [ResolvedEntity.oppilasJaOpintoOhjaus]: [],
  [ResolvedEntity.kasvatustieteellinenAla]: [
    { value: 'KK1' },
    { value: 'KK2' },
    { value: 'KM1' },
    { value: 'KM1 + KK' },
    { value: 'KM2A' },
    { value: 'KM2A + KK' },
    { value: 'KM2B' },
    { value: 'KM2B + KK' },
    { value: 'KM3' },
    { value: 'KM3 + KK1 / KK2', tKey: 'KM3JaKK1TaiKK2' },
    { value: 'KM4A' },
    { value: 'KM4A + KK1 / KK2', tKey: 'KM4AJaKK1TaiKK2' },
    { value: 'KM4B' },
    { value: 'KM4B + KK1 / KK2', tKey: 'KM4BJaKK1TaiKK2' },
    { value: 'KL' },
    { value: 'KT' },
  ],
  [ResolvedEntity.sosiaaliJaTerveysAla]: [
    { value: 'sote1', tKey: 'sote', ordinal: '1' },
    { value: 'sote2', tKey: 'sote', ordinal: '2' },
    { value: 'sote3', tKey: 'sote', ordinal: '3' },
  ],
  [ResolvedEntity.monialaisetOpinnot]: [
    { value: 'monialaiset1', tKey: 'monialaiset', ordinal: '1' },
    { value: 'monialaiset2', tKey: 'monialaiset', ordinal: '2' },
  ],
  [ResolvedEntity.ammatillisetValmiudet]: [
    {
      value: 'vakaJaErityisopetusA',
      tKey: 'vakaJaErityisopetus',
      ordinal: 'A',
    },
    {
      value: 'vakaJaErityisopetusB',
      tKey: 'vakaJaErityisopetus',
      ordinal: 'B',
    },
    {
      value: 'vakaJaErityisopetusC',
      tKey: 'vakaJaErityisopetus',
      ordinal: 'C',
    },
    {
      value: 'vakaJaErityisopetusD',
      tKey: 'vakaJaErityisopetus',
      ordinal: 'D',
    },
  ],
  [ResolvedEntity.muu]: [],
};

const eroModel = (
  eroLkm: number,
  tarkennukset?: KoulutusEroTarkennukset,
): KoulutusEroModel => {
  return {
    id: '',
    yleisetErot: [],
    sisaltaaMuuEro: false,
    kelpoisuusKohtainenEroLkm: eroLkm,
    kelpoisuusKohtainenEroTarkennukset: tarkennukset,
  };
};

export const EROT_KOULUTUKSESSA_BY_ENTITY: Record<
  ResolvedEntity,
  KoulutusEroModel | undefined
> = {
  [ResolvedEntity.oikeustieteenMaisteri]: undefined,
  [ResolvedEntity.opetettavaAine]: eroModel(4, [
    { parentIdx: 1, lkm: 2 },
    { parentIdx: 2, lkm: 2 },
    { parentIdx: 3, lkm: 2 },
    { parentIdx: 4, lkm: 2 },
  ]),
  [ResolvedEntity.opettajanPedagogisetOpinnot]: eroModel(2),
  [ResolvedEntity.erityisopetus]: eroModel(4),
  [ResolvedEntity.oppilasJaOpintoOhjaus]: eroModel(4),
  [ResolvedEntity.kasvatustieteellinenAla]: eroModel(2),
  [ResolvedEntity.sosiaaliJaTerveysAla]: eroModel(4),
  [ResolvedEntity.monialaisetOpinnot]: eroModel(2),
  [ResolvedEntity.ammatillisetValmiudet]: eroModel(2),
  [ResolvedEntity.muu]: undefined,
};

export const AMMATTIKOKEMUKSEN_HUOMIOIMINEN_OPTIONS: Array<AmmattikokemuksenHuomioiminen> =
  [
    'SuomessaHankittuKokonaan',
    'SuomessaHankittuOsittain',
    'UlkomaillaHankittuKokonaan',
    'UlkomaillaHankittuOsittain',
    'SuomessaJaUlkomaillaHankittuKokonaan',
    'SuomessaJaUlkomaillaHankittuOsittain',
    'EiHuomioida',
  ];

export const TAYSI_AMMATTIKOKEMUS_OPTIONS: Array<AmmattikokemuksenHuomioiminen> =
  [
    'SuomessaHankittuKokonaan',
    'UlkomaillaHankittuKokonaan',
    'SuomessaJaUlkomaillaHankittuKokonaan',
  ];

export const OSITTAINEN_AMMATTIKOKEMUS_OPTIONS: Array<AmmattikokemuksenHuomioiminen> =
  [
    'SuomessaHankittuOsittain',
    'UlkomaillaHankittuOsittain',
    'SuomessaJaUlkomaillaHankittuOsittain',
  ];

export const SUOMESSASUORITETTUJEN_OPINTOJEN_HUOMIOIMINEN_OPTIONS: Array<SuomessaSuoritettujenOpintojenHuomioiminen> =
  ['KorvaavatKokonaan', 'KorvaavatOsittain', 'EiHuomioida'];

export const shouldShowKorvaavaToimenpide = (
  ammattikokemuksenHuomioiminen?: AmmattikokemuksenHuomioiminen | null,
  suomessaSuoritettujenOpintojenHuomioiminen?: SuomessaSuoritettujenOpintojenHuomioiminen | null,
) => {
  return (
    ((ammattikokemuksenHuomioiminen &&
      OSITTAINEN_AMMATTIKOKEMUS_OPTIONS.includes(
        ammattikokemuksenHuomioiminen,
      )) ||
      suomessaSuoritettujenOpintojenHuomioiminen === 'KorvaavatOsittain') &&
    !(
      (ammattikokemuksenHuomioiminen &&
        TAYSI_AMMATTIKOKEMUS_OPTIONS.includes(ammattikokemuksenHuomioiminen)) ||
      suomessaSuoritettujenOpintojenHuomioiminen === 'KorvaavatKokonaan'
    )
  );
};

const OPETETTAVA_AINE_SOVELLETUT_TILANTEET_WO_EROT = ['aine1', 'aine4'];

export const shouldShowLisavalinnat = (
  entity: ResolvedEntity,
  sovellettuTilanne?: string | null,
) => {
  if (
    entity === ResolvedEntity.opetettavaAine &&
    sovellettuTilanne &&
    OPETETTAVA_AINE_SOVELLETUT_TILANTEET_WO_EROT.includes(sovellettuTilanne)
  ) {
    return false;
  }
  return entity !== ResolvedEntity.oikeustieteenMaisteri;
};

const KOULUTUSERO_TARKENNUS_KIINTEAT_KAANNOSAVAIMET: Record<
  string,
  string | undefined
> = {
  'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.ero1.tarkennus1':
    'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.laajuus',
  'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.ero1.tarkennus2':
    'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.sisalto',
  'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.ero2.tarkennus1':
    'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.laajuus',
  'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.ero2.tarkennus2':
    'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.sisalto',
  'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.ero3.tarkennus1':
    'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.laajuus',
  'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.ero3.tarkennus2':
    'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.sisalto',
  'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.ero4.tarkennus1':
    'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.laajuus',
  'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.ero4.tarkennus2':
    'hakemus.paatos.myonteinenPaatos.uo.erotKoulutuksessa.opetettavaAine.sisalto',
};

export const translationForEroTarkennus = (t: TFunction, tKey: string) => {
  const fixedKey = KOULUTUSERO_TARKENNUS_KIINTEAT_KAANNOSAVAIMET[tKey];
  return fixedKey ? t(fixedKey) : t(tKey);
};

export const newLaajuusValue = (
  currentValue?: number | null,
  numberValue?: number | null,
): number | null | undefined => {
  if (numberValue === undefined) return currentValue;
  return numberValue;
};

export const emptyOikeustieteenMaisterinOpinnot =
  (): OikeustieteenMaisteriLisavaatimukset => ({
    tallinnassaSuoritettujaOpintoja: false,
    isTallinnaOpintojenLaajuusModified: false,
    eurooppaOpintojaSisallossa: false,
    eurooppaOpintojaKokonaismaarassa: false,
    suomiOpintojaSisallossa: false,
    suomiOpintojaLaajuudessa: false,
  });

export const presetSuomiOpintojenAihealue = (
  val: boolean,
): OikeustieteenSuomiOpintojenAihealue => ({
  velvoiteOikeus: val,
  esineOikeus: val,
  perheJaJaamistooikeus: val,
  rikosoikeus: val,
  prosessiOikeus: val,
  valtioSaantooikeus: val,
  hallintoOikeus: val,
});

export const initOrUpdateOikeustieteenMaisteriOpinnot = (
  lisavaatimukset?: OikeustieteenMaisteriLisavaatimukset,
): OikeustieteenMaisteriLisavaatimukset => {
  const tobe = lisavaatimukset
    ? lisavaatimukset
    : emptyOikeustieteenMaisterinOpinnot();
  if (tobe.tallinnassaSuoritettujaOpintoja) {
    if (!tobe.isTallinnaOpintojenLaajuusModified) {
      tobe.tallinnaOpintojenLaajuus = 10;
    }
  } else {
    tobe.tallinnaOpintojenLaajuus = null;
    tobe.isTallinnaOpintojenLaajuusModified = false;
  }

  if (!tobe.eurooppaOpintojaSisallossa) {
    tobe.eurooppaOpintojenSisallonLisatieto = null;
  }
  if (!tobe.eurooppaOpintojaKokonaismaarassa) {
    tobe.eurooppaOpintojenLaajuus = null;
  }

  if (tobe.suomiOpintojaSisallossa) {
    tobe.suomiOpintojenAihealueet =
      tobe.suomiOpintojenAihealueet ?? presetSuomiOpintojenAihealue(false);
  } else {
    tobe.suomiOpintojenAihealueet = null;
    tobe.suomiOpintojenSisallonLisatieto = null;
  }

  if (!tobe.suomiOpintojaLaajuudessa) {
    tobe.suomiOpintojenLaajuus = null;
  }

  return tobe;
};

export const emptyTutkintoTaiOpintoMyonteinenUo =
  (): MyonteisenPaatoksenLisavaatimukset => ({
    oikeustieteenMaisteriLisavaatimukset: undefined,
    opettajuuttaTutkimassa: false,
    suomalainenKoulu: false,
    opetusNayte: false,
    taydentavatOpinnot: false,
    kelpoisuuskoe: false,
    sopeutumisaika: false,
  });

export const initOrUpdateTutkintoTaiOpintoMyonteinenUo = (
  currentEntity: ResolvedEntity,
  updated: Partial<MyonteisenPaatoksenLisavaatimukset>,
  current?: MyonteisenPaatoksenLisavaatimukset,
): MyonteisenPaatoksenLisavaatimukset => {
  if (
    updated.sovellettuTilanne &&
    (current?.sovellettuTilanne ?? null) !== updated.sovellettuTilanne
  ) {
    const tobe = emptyTutkintoTaiOpintoMyonteinenUo();
    tobe.sovellettuTilanne = updated.sovellettuTilanne;
    return tobe;
  }

  if (currentEntity === ResolvedEntity.oikeustieteenMaisteri) {
    return {
      ...emptyTutkintoTaiOpintoMyonteinenUo(),
      sovellettuTilanne: current?.sovellettuTilanne,
      oikeustieteenMaisteriLisavaatimukset:
        initOrUpdateOikeustieteenMaisteriOpinnot({
          ...emptyOikeustieteenMaisterinOpinnot(),
          ...current?.oikeustieteenMaisteriLisavaatimukset,
          ...updated.oikeustieteenMaisteriLisavaatimukset,
        }),
    };
  }

  const tobe = {
    ...emptyTutkintoTaiOpintoMyonteinenUo(),
    ...current,
    ...updated,
  };

  if (EROT_KOULUTUKSESSA_BY_ENTITY[currentEntity]) {
    tobe.erotKoulutuksessa = initOrUpdateErotKoulutuksessa(
      {
        ...emptyErotKoulutuksessaForModel(
          EROT_KOULUTUKSESSA_BY_ENTITY[currentEntity],
        ),
        ...current?.erotKoulutuksessa,
      },
      updated.erotKoulutuksessa,
    );
  } else {
    tobe.erotKoulutuksessa = undefined;
  }
  tobe.lahtokohtaisetOsaamisenTaydentamisenTavat =
    initOrUpdateKorvaavaToimenpide(
      tobe.lahtokohtaisetOsaamisenTaydentamisenTavat,
    );
  if (
    shouldShowKorvaavaToimenpide(
      tobe.ammattikokemuksenHuomioiminen,
      tobe.suomessaSuoritettujenOpintojenHuomioiminen,
    )
  ) {
    tobe.korvaavaToimenpide = initOrUpdateKorvaavaToimenpide(
      tobe.korvaavaToimenpide,
    );
  } else {
    tobe.korvaavaToimenpide = undefined;
  }
  return tobe;
};
