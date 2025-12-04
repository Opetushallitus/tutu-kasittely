export type LanguageCode = 'fi' | 'sv' | 'en';

interface OphRadioOption<T> {
  value: T;
  label: string;
}

export type NamedBoolean = {
  name: string;
  value: boolean;
};
