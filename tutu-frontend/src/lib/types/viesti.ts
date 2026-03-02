import { Language } from '@/src/lib/localization/localizationTypes';

export type Viestityyppi = 'taydennyspyynto' | 'ennakkotieto' | 'muu';

export type Viesti = {
  id?: string;
  kieli: Language;
  tyyppi?: Viestityyppi | null;
  otsikko?: string | null;
  viesti?: string | null;
  vahvistettu?: string;
  vahvistaja?: string;
};
