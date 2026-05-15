import {
  Language,
  TranslatedName,
} from '@/src/lib/localization/localizationTypes';

export type Viestityyppi = 'taydennyspyynto' | 'ennakkotieto' | 'muu';

export type Viesti = {
  id?: string;
  kieli: Language;
  tyyppi?: Viestityyppi | null;
  otsikko?: string | null;
  viesti?: string | null;
  vahvistettu?: string;
  vahvistaja?: string;
  luotu?: string | null;
  luoja?: string | null;
  muokattu?: string | null;
  muokkaaja?: string | null;
};

export type VahvistettuViestiListItem = {
  id: string;
  tyyppi: Viestityyppi;
  otsikko: string;
  vahvistettu: string;
};

export type Viestipohja = {
  id?: string;
  sisalto: TranslatedName;
  nimi: string;
  kategoriaId?: string;
  luotu?: string | null;
  luoja?: string | null;
  muokattu?: string | null;
  muokkaaja?: string | null;
};

export type ViestipohjaListItem = {
  id: string;
  kategoriaId?: string;
  nimi: string;
};

export type ViestipohjaKategoria = {
  id?: string;
  nimi: string;
};

export type TekstipohjaItem = {
  id: string;
  nimi: string;
};

export type KategorianTekstipohjat = {
  kategoriaNimi: string;
  pohjat: TekstipohjaItem[];
};
