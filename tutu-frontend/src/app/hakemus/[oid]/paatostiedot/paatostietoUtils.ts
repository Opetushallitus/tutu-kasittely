import { PaatosTietoOption } from '@/src/lib/types/paatos';
import { Language } from '@/src/lib/localization/localizationTypes';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

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
