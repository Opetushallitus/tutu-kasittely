import {
  emptyAmmattikokemusJaElinikainenOppiminen,
  emptyKelpoisuuskoeSisalto,
  emptyKorvaavaToimenpide,
  erotKoulutuksessaOptions,
  KoulutusEroModel,
  MONIALAISET_OPINNOT_KEY,
  MUU_AMMATTI_KEY,
  oletusKoulutusErot,
  VARHAISKASVATUS_JA_ESIOPETUS_VALMIUS_OPINNOT_KEY,
  yleinenKoulutusEroTranslationKeys,
} from '@/src/app/hakemus/paatostiedot/constants';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  Language,
  TranslatedName,
} from '@/src/lib/localization/localizationTypes';
import { TreeOption } from '@/src/lib/localization/translationUtils';
import { NamedBoolean } from '@/src/lib/types/common';
import {
  ErotKoulutuksessa,
  KelpoisuudenLisavaatimukset,
  KielteisenPaatoksenPerustelut,
  KorvaavaToimenpide,
  KorvaavaToimenpideDto,
  MyonteisenPaatoksenLisavaatimukset,
  Paatos,
  PaatosTieto,
  PeruutuksenTaiRaukeamisenSyy,
} from '@/src/lib/types/paatos';

export const getPaatosTietoDropdownOptions = (
  lang: Language,
  paatostietoOptions: TreeOption<TranslatedName>[],
  maxHierarkiaSyvyys: number = Infinity,
  currentHierarkiaLevel: number = 0,
): TreeOption[] => {
  return paatostietoOptions.map((option) => {
    const keyOption: TreeOption = {
      label: option.label[lang]!,
      value: option.value!,
    };

    if (
      currentHierarkiaLevel < maxHierarkiaSyvyys - 1 &&
      option.children &&
      option.children.length > 0
    ) {
      return {
        ...keyOption,
        children: getPaatosTietoDropdownOptions(
          lang,
          option.children,
          maxHierarkiaSyvyys,
          currentHierarkiaLevel + 1,
        ),
      };
    }
    return keyOption;
  });
};

export const findOptionByValue = (
  options: TreeOption<TranslatedName>[],
  value: string,
): TreeOption<TranslatedName> | null => {
  for (const option of options) {
    if (option.value === value) {
      return option;
    }
    if (option.children) {
      const found = findOptionByValue(option.children, value);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export const getKelpoisuusMuuAmmattiDropdownValue = (t: TFunction): string =>
  t('hakemus.paatos.paatostyyppi.kelpoisuus.additionalKelpoisuudet.muuAmmatti');

export const getKelpoisuusMuuAmmattiDropdownOption = (
  t: TFunction,
): TreeOption => {
  const muuAmmattiTranslated = getKelpoisuusMuuAmmattiDropdownValue(t);

  const muuAmmattiOption: TreeOption = {
    label: muuAmmattiTranslated,
    value: MUU_AMMATTI_KEY,
  };

  return { ...muuAmmattiOption, children: [muuAmmattiOption] };
};

export const getTiettyTutkintoTaiOpinnotAdditionalOptions = (
  t: TFunction,
): TreeOption[] => [
  {
    label: t(
      'hakemus.paatos.paatostyyppi.tiettyTutkintoTaiOpinnot.monialaisetOpinnot',
    ),
    value: MONIALAISET_OPINNOT_KEY,
  },
  {
    label: t(
      'hakemus.paatos.paatostyyppi.tiettyTutkintoTaiOpinnot.varhaiskasvatusJaEsiopetusValmiusOpinnot',
    ),
    value: VARHAISKASVATUS_JA_ESIOPETUS_VALMIUS_OPINNOT_KEY,
  },
];

const createEroArray = (namePrefix: string, lkm: number) => {
  return Array.from(
    {
      length: lkm,
    },
    (_, i) => ({ name: `${namePrefix}${i + 1}`, value: false }),
  );
};

export const emptyErotKoulutuksessa = (kelpoisuusKey?: string) => {
  const eroModel = koulutusEroModel(kelpoisuusKey);
  return emptyErotKoulutuksessaForModel(eroModel);
};

export const emptyErotKoulutuksessaForModel = (
  eroModel: KoulutusEroModel,
): ErotKoulutuksessa => {
  const kelpoisuusKohtaiset: NamedBoolean[] = createEroArray(
    'ero',
    eroModel.kelpoisuusKohtainenEroLkm,
  );

  const yleiset: NamedBoolean[] = eroModel.yleisetErot.map((eroKey) => ({
    name: eroKey,
    value: false,
  }));

  const tarkennukset = eroModel.kelpoisuusKohtainenEroTarkennukset?.reduce(
    (acc, val) =>
      Object.assign(acc, {
        [`ero${val.parentIdx}`]: createEroArray('tarkennus', val.lkm),
      }),
    {},
  );

  return {
    erot: [...kelpoisuusKohtaiset, ...yleiset],
    eroTarkennukset: tarkennukset ?? {},
    muuEro: false,
    muuEroKuvaus: null,
  };
};

export const initOrUpdateErotKoulutuksessa = (
  initial: ErotKoulutuksessa,
  erotKoulutuksessa?: ErotKoulutuksessa | null,
): ErotKoulutuksessa => {
  if (erotKoulutuksessa) {
    const erot = (initial.erot ?? []).map((ero) => ({
      name: ero.name,
      value:
        erotKoulutuksessa?.erot?.find((eroObj) => eroObj.name === ero.name)
          ?.value ?? false,
    }));
    const eroTarkennukset =
      erotKoulutuksessa.eroTarkennukset ?? initial.eroTarkennukset;
    return { ...initial, erot, eroTarkennukset };
  }
  return initial;
};

const initOrUpdateKorvaavaToimenpide = (
  korvaavaToimenpide?: KorvaavaToimenpide | null,
): KorvaavaToimenpide => {
  const tobe = korvaavaToimenpide ?? emptyKorvaavaToimenpide();
  tobe.kelpoisuuskoeSisalto = tobe.kelpoisuuskoe
    ? (tobe.kelpoisuuskoeSisalto ?? emptyKelpoisuuskoeSisalto())
    : null;
  tobe.kelpoisuuskoeJaSopeutumisaikaSisalto = tobe.kelpoisuuskoeJaSopeutumisaika
    ? (tobe.kelpoisuuskoeJaSopeutumisaikaSisalto ?? emptyKelpoisuuskoeSisalto())
    : null;
  tobe.sopeutumiusaikaKestoKk = tobe.sopeutumisaika
    ? tobe.sopeutumiusaikaKestoKk
    : null;
  tobe.kelpoisuuskoeJaSopeutumisaikaKestoKk = tobe.kelpoisuuskoeJaSopeutumisaika
    ? tobe.kelpoisuuskoeJaSopeutumisaikaKestoKk
    : null;

  return tobe;
};

export const initOrUpdateMyonteinenKelpoisuusPaatos = (
  currentKelpoisuudenLisavaatimukset: KelpoisuudenLisavaatimukset,
  updatedKelpoisuudenLisavaatimuket: Partial<KelpoisuudenLisavaatimukset>,
  kelpoisuusKey?: string,
): KelpoisuudenLisavaatimukset => {
  const tobe = {
    ...currentKelpoisuudenLisavaatimukset,
    ...updatedKelpoisuudenLisavaatimuket,
  };
  if (tobe.olennaisiaEroja) {
    tobe.erotKoulutuksessa =
      tobe.erotKoulutuksessa ?? emptyErotKoulutuksessa(kelpoisuusKey);
    tobe.korvaavaToimenpide = initOrUpdateKorvaavaToimenpide(
      tobe.korvaavaToimenpide,
    );
    tobe.ammattikokemusJaElinikainenOppiminen =
      tobe.ammattikokemusJaElinikainenOppiminen ??
      emptyAmmattikokemusJaElinikainenOppiminen();

    if (
      tobe.ammattikokemusJaElinikainenOppiminen.korvaavuusAmmattikokemus ===
        'Osittainen' ||
      tobe.ammattikokemusJaElinikainenOppiminen
        .korvaavuusElinikainenOppiminen === 'Osittainen'
    ) {
      tobe.ammattikokemusJaElinikainenOppiminen.korvaavaToimenpide =
        initOrUpdateKorvaavaToimenpide(
          tobe.ammattikokemusJaElinikainenOppiminen.korvaavaToimenpide,
        );
    } else {
      tobe.ammattikokemusJaElinikainenOppiminen.korvaavaToimenpide = null;
    }
  } else {
    tobe.erotKoulutuksessa = null;
    tobe.korvaavaToimenpide = null;
    tobe.ammattikokemusJaElinikainenOppiminen = null;
  }

  return tobe;
};

export const initOrUpdateMyonteinenKelpoisuusPaatosUO = (
  currentKelpoisuudenLisavaatimukset: KelpoisuudenLisavaatimukset,
  updatedKelpoisuudenLisavaatimukset: Partial<KelpoisuudenLisavaatimukset>,
  showOsaamisenTaydentamisenTavat: boolean,
  kelpoisuusKey?: string,
): KelpoisuudenLisavaatimukset => {
  const tobe = {
    ...currentKelpoisuudenLisavaatimukset,
    ...updatedKelpoisuudenLisavaatimukset,
  };
  tobe.erotKoulutuksessa =
    tobe.erotKoulutuksessa ?? emptyErotKoulutuksessa(kelpoisuusKey);
  tobe.korvaavaToimenpide = showOsaamisenTaydentamisenTavat
    ? initOrUpdateKorvaavaToimenpide(tobe.korvaavaToimenpide)
    : null;
  tobe.lahtokohtaisetOsaamisenTaydentamisenTavat =
    initOrUpdateKorvaavaToimenpide(
      tobe.lahtokohtaisetOsaamisenTaydentamisenTavat,
    );
  tobe.olennaisiaEroja = null;
  tobe.ammattikokemusJaElinikainenOppiminen = null;

  return tobe;
};

export const koulutusEroModel = (kelpoisuusKey?: string) => {
  const key = kelpoisuusKey;
  const option = kelpoisuusKey
    ? erotKoulutuksessaOptions.find((option) => option.kelpoisuusKey === key)
    : null;
  return option ?? oletusKoulutusErot;
};

export const setKoulutusEroValues = (
  current: NamedBoolean[],
  ero: string,
  val: boolean,
): NamedBoolean[] => {
  return current.map((named) =>
    named.name === ero ? { name: ero, value: val } : named,
  );
};

export const yleinenKoulutusEroTranslation = (
  eroKey: string,
  t: TFunction,
): string | undefined => {
  return eroKey in yleinenKoulutusEroTranslationKeys
    ? t(
        yleinenKoulutusEroTranslationKeys[
          eroKey as keyof typeof yleinenKoulutusEroTranslationKeys
        ],
      )
    : undefined;
};

export const korvaavaToimenpide2Paatostiedot = (
  korvaavaToimenpideDto: KorvaavaToimenpideDto,
): [Partial<Paatos>, Partial<PaatosTieto> | null] => {
  if (korvaavaToimenpideDto.esittelijanHuomioita) {
    return [
      {},
      {
        esittelijanHuomioitaToimenpiteista:
          korvaavaToimenpideDto.esittelijanHuomioita,
      },
    ];
  } else if (korvaavaToimenpideDto.suoritusTila) {
    switch (korvaavaToimenpideDto.suoritusTila) {
      case 'myonteinen':
        return [
          { ratkaisutyyppi: 'Paatos' },
          { paatosTyyppi: 'LopullinenPaatos', myonteinenPaatos: true },
        ];
      case 'kielteinen':
        return [
          { ratkaisutyyppi: 'Paatos' },
          { paatosTyyppi: 'LopullinenPaatos', myonteinenPaatos: false },
        ];
      case 'peruttu':
        return [
          { ratkaisutyyppi: 'PeruutusTaiRaukeaminen' },
          { paatosTyyppi: 'LopullinenPaatos' },
        ];
      default:
        return [{ ratkaisutyyppi: null }, null];
    }
  }
  return [{}, {}];
};

export const emptyKielteisenPaatoksenPerustelut =
  (): KielteisenPaatoksenPerustelut => ({
    epavirallinenKorkeakoulu: false,
    epavirallinenTutkinto: false,
    eiVastaaSuomessaSuoritettavaaTutkintoa: false,
    tutkintoEiVastaaTasoltaanSuomessaSuoritettavaaTutkintoa: false,
    tutkintoEiVastaaSisalloltaanSuomessaSuoritettavaaTutkintoa: false,
    opinnotEiVastaaTasoltaanSuomessaSuoritettaviaOpintoja: false,
    opinnotEiVastaaSisalloltaanSuomessaSuoritettaviaOpintoja: false,
    eiEuTaiEtaKansalainenEikaRinnastettavaaAsiakirjaa: false,
    eiApMukainenTutkintoTaiHaettuaPatevyytta: false,
    koulutusEiVastaaApMukaistaTutkintoaEikaTaydennettavissaKorvaavillaToimenpiteilla: false,
    muuPerustelu: false,
    muuPerusteluKuvaus: null,
  });

export const emptyMyonteisenPaatoksenLisavaatimukset =
  (): MyonteisenPaatoksenLisavaatimukset => ({
    taydentavatOpinnot: false,
    kelpoisuuskoe: false,
    sopeutumisaika: false,
    opettajuuttaTutkimassa: false,
    suomalainenKoulu: false,
    opetusNayte: false,
    sovellettuTilanne: null,
    erotKoulutuksessa: null,
    lahtokohtaisetOsaamisenTaydentamisenTavat: null,
    ammattikokemuksenHuomioiminen: null,
    suomessaSuoritettujenOpintojenHuomioiminen: null,
    korvaavaToimenpide: null,
    oikeustieteenMaisteriLisavaatimukset: null,
  });

export const emptyPeruutuksenTaiRaukeamisenSyy =
  (): PeruutuksenTaiRaukeamisenSyy => ({
    eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada: false,
    muutenTyytymatonRatkaisuun: false,
    eiApMukainenTutkintoTaiHaettuaPatevyytta: false,
    eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa: false,
    epavirallinenKorkeakouluTaiTutkinto: false,
    eiEdellytyksiaRoEikaTasopaatokselle: false,
    eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin: false,
    hakijallaJoPaatosSamastaKoulutusKokonaisuudesta: false,
    muuSyy: false,
  });

export const emptyPaatosTieto = (paatosId: string): PaatosTieto => ({
  id: `new-${Date.now()}`,
  paatosId: paatosId,
  paatosTyyppi: undefined,
  lisaaTutkintoPaatostekstiin: false,
  kielteisenPaatoksenPerustelut: emptyKielteisenPaatoksenPerustelut(),
  rinnastettavatTutkinnotTaiOpinnot: [],
  kelpoisuudet: [],
});
