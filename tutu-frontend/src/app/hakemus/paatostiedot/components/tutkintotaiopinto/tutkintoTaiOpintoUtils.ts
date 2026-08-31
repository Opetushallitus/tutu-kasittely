import { SovellettuTilanneOption } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/SovellettuTilanneSelection';
import {
  ERITYISOPETUS_OPINNOT_KEYS,
  KoulutusEroModel,
  KoulutusEroTarkennukset,
  OHJAUS_TEHTAVA_OPINNOT,
  OIKEUSTIETEEN_MAISTERI_KEYS,
  OPETETTAVAN_AINEEN_OPINNOT_KEYS,
  OPETTAJAN_PEDAGOGISET_OPINNOT_KEYS,
} from '@/src/app/hakemus/paatostiedot/constants';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  AmmattikokemuksenHuomioiminen,
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
    keywords: OIKEUSTIETEEN_MAISTERI_KEYS,
  },
  {
    tutkintoTaiOpinto: ResolvedEntity.opetettavaAine,
    keywords: OPETETTAVAN_AINEEN_OPINNOT_KEYS,
  },
  {
    tutkintoTaiOpinto: ResolvedEntity.opettajanPedagogisetOpinnot,
    keywords: OPETTAJAN_PEDAGOGISET_OPINNOT_KEYS,
  },
  {
    tutkintoTaiOpinto: ResolvedEntity.erityisopetus,
    keywords: ERITYISOPETUS_OPINNOT_KEYS,
  },
  { tutkintoTaiOpinto: ResolvedEntity.oppilasJaOpintoOhjaus, keywords: [] },
  {
    tutkintoTaiOpinto: ResolvedEntity.oppilasJaOpintoOhjaus,
    keywords: OHJAUS_TEHTAVA_OPINNOT,
  },
  { tutkintoTaiOpinto: ResolvedEntity.kasvatustieteellinenAla, keywords: [] },
  { tutkintoTaiOpinto: ResolvedEntity.sosiaaliJaTerveysAla, keywords: [] },
  { tutkintoTaiOpinto: ResolvedEntity.monialaisetOpinnot, keywords: [] },
  { tutkintoTaiOpinto: ResolvedEntity.ammatillisetValmiudet, keywords: [] },
  { tutkintoTaiOpinto: ResolvedEntity.muu, keywords: [] },
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
  [ResolvedEntity.kasvatustieteellinenAla]: [],
  [ResolvedEntity.sosiaaliJaTerveysAla]: [],
  [ResolvedEntity.monialaisetOpinnot]: [],
  [ResolvedEntity.ammatillisetValmiudet]: [],
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
  [ResolvedEntity.kasvatustieteellinenAla]: undefined,
  [ResolvedEntity.sosiaaliJaTerveysAla]: undefined,
  [ResolvedEntity.monialaisetOpinnot]: undefined,
  [ResolvedEntity.ammatillisetValmiudet]: undefined,
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

export const shouldShowOsaamisenTaydentamisenTavat = (
  entity: ResolvedEntity,
  ammattikokemuksenHuomioiminen?: AmmattikokemuksenHuomioiminen,
  suomessaSuoritettujenOpintojenHuomioiminen?: SuomessaSuoritettujenOpintojenHuomioiminen,
) => {
  if (entity === ResolvedEntity.opetettavaAine) {
    return (
      ammattikokemuksenHuomioiminen === 'SuomessaHankittuOsittain' ||
      ammattikokemuksenHuomioiminen === 'UlkomaillaHankittuOsittain'
    );
  }
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
  sovellettuTilanne?: string,
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
