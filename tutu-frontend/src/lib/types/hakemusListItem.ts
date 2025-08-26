export type HakemusListItem = {
  asiatunnus: string;
  hakija: string;
  vaihe: string;
  aika: string;
  viimeinenAsiakirjaHakijalta?: string;
  hakemusOid: string;
  hakemusKoskee: number;
  esittelijaOid: string;
  esittelijaKutsumanimi: string;
  esittelijaSukunimi: string;
  kasittelyVaihe: string;
  muokattu: string;
  taydennyspyyntoLahetetty: string;
  apHakemus?: boolean;
};
