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
  allekirjoituksetTarkistettuLisatiedot: string | null | undefined;
  alkuperaisetAsiakirjatSaatuNahtavaksi: boolean;
  alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: string | null | undefined;
  selvityksetSaatu: boolean;
  viimeinenAsiakirjaHakijalta?: string;
  asiakirjamallitTutkinnoista?: AsiakirjamallitTutkinnoista;
  imiPyynto: ImiPyynto;
  apHakemus?: boolean;
  yhteistutkinto: boolean;
  suostumusVahvistamiselleSaatu: boolean;
  tutkinnot: Tutkinto[];
};

export type HakemusUpdateCallback = (patch: Partial<Hakemus>) => void;

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
  formId?: string;
};

export type AsiakirjaMetadata = {
  key: string;
  filename: string;
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

export type AsiakirjamallitTutkinnoista = Partial<
  Record<AsiakirjamalliLahde, AsiakirjamalliTutkinnosta>
>;

export type ImiPyynto = {
  imiPyynto?: boolean;
  imiPyyntoNumero: string;
  imiPyyntoLahetetty: string;
  imiPyyntoVastattu: string;
};

export type Tutkinto = {
  id?: string;
  hakemusId: string;
  jarjestys: string;
  nimi?: string;
  oppilaitos?: string;
  aloitusVuosi?: number;
  paattymisVuosi?: number;
  maakoodi?: string;
  muuTutkintoTieto?: string;
  todistuksenPaivamaara?: string;
  koulutusalaKoodi?: string;
  paaaaineTaiErikoisala?: string;
  todistusOtsikko?: string;
  muuTutkintoMuistioId?: string;
};
