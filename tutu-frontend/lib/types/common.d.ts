export type LanguageCode = 'fi' | 'sv' | 'en';

export type Kielistetty<T = string> = Record<LanguageCode, T>;

export type User = {
  userOid: string;
  authorities: Array<string>;
  asiointikieli: string;
};

type Koodi = {
  koodiarvo: string;
  koodinimi: Kielistetty;
};
