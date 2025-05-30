export type LanguageCode = 'fi' | 'sv' | 'en';

export type Kielistetty<T = string> = Record<LanguageCode, T>;

type Koodi = {
  koodiarvo: string;
  koodinimi: Kielistetty;
};
