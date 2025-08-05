import { Hakija } from '@/src/lib/types/hakija';
import { Kielistetty } from '@/src/lib/types/common';

export type MuutosHistoriaItem = {
  role: 'Esittelija' | 'Hakija' | 'Irrelevant';
  time: string;
  modifiedBy: string;
};

export type Hakemus = {
  hakemusOid: string;
  lomakeOid: string;
  hakemusKoskee: number;
  readonly hakija: Hakija;
  asiatunnus: string;
  kirjausPvm: string;
  esittelyPvm: string;
  paatosPvm: string;
  esittelijaOid: string;
  ataruHakemuksenTila: string;
  kasittelyVaihe: string;
  muokattu: string;
  muutosHistoria: MuutosHistoriaItem[];
  taydennyspyyntoLahetetty: string;
  sisalto: SisaltoItem[];
  liitteidenTilat: TarkistuksenTila[];
  allekirjoituksetTarkistettu: string?;
};

export type SisaltoItem = {
  key: string;
  fieldType: string;
  value: SisaltoValue[];
  label: Kielistetty;
  children: SisaltoItem[];
};

export type SisaltoValue = {
  label: Kielistetty;
  value: string;
  followups: SisaltoItem[];
};

export type TarkistuksenTila = {
  attachment: string;
  state: string;
  hakukohde: string;
};
