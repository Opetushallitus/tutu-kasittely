import { Language } from '@/src/lib/localization/localizationTypes';

export type Viestityyppi = 'taydennyspyynto' | 'ennakkotieto' | 'muu';

export type Viesti = {
  id?: string;
  kieli: Language;
  viestityyppi: Viestityyppi;
  otsikko?: string;
  viesti?: string;
  vahvistettu?: string;
  vahvistaja?: string;
};
