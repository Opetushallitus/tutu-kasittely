import { HakemusKoskee } from './hakemus';

export type HakemusListItem = {
  asiatunnus: string;
  hakija: string;
  vaihe: string;
  aika: string;
  viimeinenAsiakirjaHakijalta?: string;
  hakemusOid: string;
  hakemusKoskee: HakemusKoskee;
  esittelijaOid: string;
  esittelijaKutsumanimi: string;
  esittelijaSukunimi: string;
  kasittelyVaihe: string;
  muokattu: string;
  taydennyspyyntoLahetetty?: string;
  ataruHakemustaMuokattu?: string;
  apHakemus?: boolean;
  onkoPeruutettu?: boolean;
};
