export type LanguageCode = 'fi' | 'sv' | 'en';

export interface OphRadioOption<T> {
  value: T;
  label: string;
}

export type NamedBoolean = {
  name: string;
  value: boolean;
};

export type OphSelectOption<T = string> = {
  label: T;
  value: T;
};
