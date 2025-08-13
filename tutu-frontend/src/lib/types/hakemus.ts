import { Hakija } from '@/src/lib/types/hakija';
import { TranslatedName } from '@/src/lib/localization/localizationTypes';

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
  pyydettavatAsiakirjat: AsiakirjaPyynto[];
  allekirjoituksetTarkistettu: boolean;
  allekirjoituksetTarkistettuLisatiedot: string | undefined;
  alkuperaisetAsiakirjatSaatuNahtavaksi: boolean;
  alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: string | undefined;
  selvityksetSaatu: boolean;
  asiakirjamallitTutkinnoista?: Partial<
    Record<AsiakirjamalliLahde, AsiakirjamalliTutkinnosta>
  >;
  imiPyynto: ImiPyynto;
  apHakemus: boolean;
};

export type SisaltoItem = {
  key: string;
  fieldType: string;
  value: SisaltoValue[];
  label: TranslatedName;
  children: SisaltoItem[];
};

export type SisaltoValue = {
  label: TranslatedName;
  value: string;
  followups: SisaltoItem[];
};

export type TarkistuksenTila = {
  attachment: string;
  state: string;
  hakukohde: string;
};

export type AsiakirjaPyynto = {
  id?: string;
  asiakirjanTyyppi: string;
};

export type AsiakirjamalliLahde =
  | 'ece'
  | 'UK_enic'
  | 'naric_portal'
  | 'nuffic'
  | 'aacrao'
  | 'muu';

export type AsiakirjamalliTutkinnosta = {
  lahde: AsiakirjamalliLahde;
  vastaavuus: boolean;
  kuvaus?: string;
};

export type ImiPyynto = {
  imiPyynto: boolean | null;
  imiPyyntoNumero: string;
  imiPyyntoLahetetty: string;
  imiPyyntoVastattu: string;
};
