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

export const HAKIJA_FIELDS_WO_SAHKOPOSTI = [
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
];
