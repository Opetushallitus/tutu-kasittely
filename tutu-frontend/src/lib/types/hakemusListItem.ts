import { HakemusKoskee } from './hakemus';
import { HakijaListItem } from './hakija';

export type HakemusListItem = {
  asiatunnus: string;
  hakija: HakijaListItem;
  saapumisPvm: string;
  hakemusOid: string;
  hakemusKoskee: HakemusKoskee;
  esittelijaOid: string | null;
  esittelijaKutsumanimi: string | null;
  esittelijaSukunimi: string | null;
  kasittelyVaihe: string;
  muokattu: string | null;
  taydennyspyyntoLahetetty?: string | null;
  ataruHakemustaMuokattu?: string | null;
  apHakemus?: boolean | null;
  viimeinenAsiakirjaHakijalta?: string | null;
  onkoPeruutettu?: boolean | null;
};
