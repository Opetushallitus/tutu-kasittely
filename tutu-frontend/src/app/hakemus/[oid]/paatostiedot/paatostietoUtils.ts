import {
  emptyAmmattikokemusJaElinikainenOppiminen,
  emptyKelpoisuuskoeSisalto,
  emptyKorvaavaToimenpide,
  erotKoulutuksessaOptions,
  MUU_AMMATTI_KEY,
  oletusKoulutusErot,
  yleinenKoulutusEroTranslationKeys,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';
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
  KorvaavaToimenpide,
  KorvaavaToimenpideDto,
  Paatos,
  PaatosTieto,
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
      value: option.value[lang]!,
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
  lang: Language,
  options: TreeOption<TranslatedName>[],
  value: string,
): TreeOption<TranslatedName> | null => {
  for (const option of options) {
    if (option.value[lang] === value) {
      return option;
    }
    if (option.children) {
      const found = findOptionByValue(lang, option.children, value);
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

const createEroArray = (namePrefix: string, lkm: number) => {
  return Array.from(
    {
      length: lkm,
    },
    (_, i) => ({ name: `${namePrefix}${i + 1}`, value: false }),
  );
};

export const emptyErotKoulutuksessa = (
  kelpoisuusKey?: string,
): ErotKoulutuksessa => {
  const eroModel = koulutusEroModel(kelpoisuusKey);
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
        [`ero${val.parent}`]: createEroArray('tarkennus', val.lkm),
      }),
    {},
  );

  return {
    erot: [...kelpoisuusKohtaiset, ...yleiset],
    eroTarkennukset: tarkennukset,
    muuEro: eroModel.sisaltaaMuuEro ? false : undefined,
  };
};

const initOrUpdateKorvaavaToimenpide = (
  korvaavaToimenpide?: KorvaavaToimenpide,
): KorvaavaToimenpide => {
  const tobe = korvaavaToimenpide ?? emptyKorvaavaToimenpide();
  tobe.kelpoisuuskoeSisalto = tobe.kelpoisuuskoe
    ? (tobe.kelpoisuuskoeSisalto ?? emptyKelpoisuuskoeSisalto())
    : undefined;
  tobe.kelpoisuuskoeJaSopeutumisaikaSisalto = tobe.kelpoisuuskoeJaSopeutumisaika
    ? (tobe.kelpoisuuskoeJaSopeutumisaikaSisalto ?? emptyKelpoisuuskoeSisalto())
    : undefined;
  tobe.sopeutumiusaikaKestoKk = tobe.sopeutumisaika
    ? tobe.sopeutumiusaikaKestoKk
    : undefined;
  tobe.kelpoisuuskoeJaSopeutumisaikaKestoKk = tobe.kelpoisuuskoeJaSopeutumisaika
    ? tobe.kelpoisuuskoeJaSopeutumisaikaKestoKk
    : undefined;

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
      tobe.ammattikokemusJaElinikainenOppiminen.ammattikokemus ||
      tobe.ammattikokemusJaElinikainenOppiminen.elinikainenOppiminen
    ) {
      if (
        tobe.ammattikokemusJaElinikainenOppiminen.korvaavuus === 'Osittainen'
      ) {
        tobe.ammattikokemusJaElinikainenOppiminen.korvaavaToimenpide =
          initOrUpdateKorvaavaToimenpide(
            tobe.ammattikokemusJaElinikainenOppiminen.korvaavaToimenpide,
          );
      } else {
        tobe.ammattikokemusJaElinikainenOppiminen.korvaavaToimenpide =
          undefined;
      }
    } else {
      tobe.ammattikokemusJaElinikainenOppiminen.lisatieto = undefined;
      tobe.ammattikokemusJaElinikainenOppiminen.korvaavuus = undefined;
      tobe.ammattikokemusJaElinikainenOppiminen.korvaavaToimenpide = undefined;
    }
  } else {
    tobe.erotKoulutuksessa = undefined;
    tobe.korvaavaToimenpide = undefined;
    tobe.ammattikokemusJaElinikainenOppiminen = undefined;
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
    : undefined;
  tobe.lahtokohtaisetOsaamisenTaydentamisenTavat =
    initOrUpdateKorvaavaToimenpide(
      tobe.lahtokohtaisetOsaamisenTaydentamisenTavat,
    );
  tobe.olennaisiaEroja = undefined;
  tobe.ammattikokemusJaElinikainenOppiminen = undefined;

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

export const emptyPaatosTieto = (paatosId: string): PaatosTieto => ({
  id: undefined,
  paatosId: paatosId,
  paatosTyyppi: undefined,
  kielteisenPaatoksenPerustelut: undefined,
  rinnastettavatTutkinnotTaiOpinnot: [],
  kelpoisuudet: [],
});
