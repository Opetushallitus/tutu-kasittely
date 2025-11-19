import {
  KelpoisuudenLisavaatimukset,
  KorvaavaToimenpide,
  PaatosTietoOption,
} from '@/src/lib/types/paatos';
import { Language } from '@/src/lib/localization/localizationTypes';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  emptyAmmattikokemusJaElinikainenOppiminen,
  emptyErotKoulutuksessaAineenopettaja,
  emptyKelpoisuuskoeSisalto,
  emptyKorvaavaToimenpide,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';

export type PaatosTietoDropdownOption = {
  label: string;
  value: string;
  children?: PaatosTietoDropdownOption[];
};

export const getPaatosTietoDropdownOptions = (
  lang: Language,
  paatostietoOptions: PaatosTietoOption[],
  maxHierarkiaSyvyys: number = Infinity,
  currentHierarkiaLevel: number = 0,
): PaatosTietoDropdownOption[] => {
  return paatostietoOptions.map((option) => {
    const keyOption: PaatosTietoDropdownOption = {
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
  options: PaatosTietoOption[],
  value: string,
): PaatosTietoOption | null => {
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
): PaatosTietoDropdownOption => {
  const muuAmmattiTranslated = getKelpoisuusMuuAmmattiDropdownValue(t);

  const muuAmmattiOption: PaatosTietoDropdownOption = {
    label: muuAmmattiTranslated,
    value: muuAmmattiTranslated,
  };

  return { ...muuAmmattiOption, children: [muuAmmattiOption] };
};

const initOrUpdateKorvaavaToimenpide = (
  korvaavaToimenpide?: KorvaavaToimenpide,
): KorvaavaToimenpide => {
  const tobe = korvaavaToimenpide || emptyKorvaavaToimenpide();
  if (tobe.kelpoisuuskoe || tobe.kelpoisuuskoeJaSopeutumisaika) {
    tobe.kelpoisuuskoeSisalto =
      tobe.kelpoisuuskoeSisalto || emptyKelpoisuuskoeSisalto();
  } else {
    tobe.kelpoisuuskoeSisalto = undefined;
  }

  return tobe;
};

export const initOrUpdateMyonteinenKelpoisuusPaatos = (
  currentKelpoisuudenLisavaatimukset: KelpoisuudenLisavaatimukset,
  updatedKelpoisuudenLisavaatimuket: Partial<KelpoisuudenLisavaatimukset>,
): KelpoisuudenLisavaatimukset => {
  const tobe = {
    ...currentKelpoisuudenLisavaatimukset,
    ...updatedKelpoisuudenLisavaatimuket,
  };
  if (tobe.olennaisiaEroja) {
    tobe.erotAineenopettajanKoulutuksessa =
      tobe.erotAineenopettajanKoulutuksessa ||
      emptyErotKoulutuksessaAineenopettaja();
    tobe.korvaavaToimenpide = initOrUpdateKorvaavaToimenpide(
      tobe.korvaavaToimenpide,
    );
    tobe.ammattikokemusJaElinikainenOppiminen =
      tobe.ammattikokemusJaElinikainenOppiminen ||
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
    tobe.erotAineenopettajanKoulutuksessa = undefined;
    tobe.korvaavaToimenpide = undefined;
    tobe.ammattikokemusJaElinikainenOppiminen = undefined;
  }

  return tobe;
};
