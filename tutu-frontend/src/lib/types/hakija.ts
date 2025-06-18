import { Kielistetty } from '@/src/lib/types/common';

export type Hakija = {
  etunimet: string;
  kutsumanimi: string;
  sukunimi: string;
  kansalaisuus: Kielistetty;
  hetu?: string;
  syntymaaika: string;
  matkapuhelin?: string;
  asuinmaa: Kielistetty;
  katuosoite: string;
  postinumero: string;
  postitoimipaikka: string;
  kotikunta: Kielistetty;
  sahkopostiosoite?: string;
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
