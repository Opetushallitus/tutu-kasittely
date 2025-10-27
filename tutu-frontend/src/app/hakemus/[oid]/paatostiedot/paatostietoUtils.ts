import { PaatosTietoOption } from '@/src/lib/types/paatos';

export type PaatosTietoDropdownOption = {
  label: string;
  value: string;
  children?: PaatosTietoDropdownOption[];
};

export const getPaatosTietoDropdownOptions = (
  lang: string,
  paatostietoOptions: PaatosTietoOption[],
): PaatosTietoDropdownOption[] => {
  return paatostietoOptions.map((option) => {
    const keyOption: PaatosTietoDropdownOption = {
      label: option.label[lang as 'fi' | 'en' | 'sv'],
      value: option.value[lang as 'fi' | 'en' | 'sv'],
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
