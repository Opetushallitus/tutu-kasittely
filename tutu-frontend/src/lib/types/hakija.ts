import { TranslatedName } from '@/src/lib/localization/localizationTypes';

export type Hakija = {
  etunimet: string;
  kutsumanimi: string;
  sukunimi: string;
  kansalaisuus: TranslatedName[];
  hetu?: string;
  syntymaaika: string;
  matkapuhelin?: string;
  asuinmaa: TranslatedName;
  katuosoite: string;
  postinumero: string;
  postitoimipaikka: string;
  kotikunta: TranslatedName;
  sahkopostiosoite?: string;
  yksiloityVTJ: boolean;
};

export type HakijaListItem = {
  etunimet: string;
  sukunimi: string;
};

export const HAKIJA_FIELDS = [
  'etunimet',
  'kutsumanimi',
  'sukunimi',
  'kansalaisuus',
  'hetu',
  'syntymaaika',
  'matkapuhelin',
  'asuinmaa',
  'katuosoite',
  'postinumero',
  'postitoimipaikka',
  'kotikunta',
  'sahkopostiosoite',
];
