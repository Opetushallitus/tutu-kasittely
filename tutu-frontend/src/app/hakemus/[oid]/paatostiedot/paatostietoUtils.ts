import { PaatosTietoOption } from '@/src/lib/types/paatos';

export type LocalizedDropdownOption = {
  label: string;
  value: string;
  children?: LocalizedDropdownOption[];
};

export const getPaatosTietoDropdownOptions = (
  lang: string,
  paatostietoOptions: PaatosTietoOption[],
): LocalizedDropdownOption[] => {
  return paatostietoOptions.map((option) => {
    const keyOption: LocalizedDropdownOption = {
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
