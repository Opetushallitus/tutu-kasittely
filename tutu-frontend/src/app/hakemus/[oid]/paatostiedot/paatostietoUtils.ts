import { PaatosTietoOption } from '@/src/lib/types/paatos';
import { Language } from '@/src/lib/localization/localizationTypes';

export type PaatosTietoDropdownOption = {
  label: string;
  value: string;
  children?: PaatosTietoDropdownOption[];
};

export const getPaatosTietoDropdownOptions = (
  lang: Language,
  paatostietoOptions: PaatosTietoOption[],
): PaatosTietoDropdownOption[] => {
  return paatostietoOptions.map((option) => {
    const keyOption: PaatosTietoDropdownOption = {
      label: option.label[lang as Language]!,
      value: option.value[lang as Language]!,
    };

    if (option.children && option.children.length > 0) {
      return {
        ...keyOption,
        children: getPaatosTietoDropdownOptions(lang, option.children),
      };
    }
    return keyOption;
  });
};
