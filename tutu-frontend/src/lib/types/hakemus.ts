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
  asiakirja: AsiakirjaTieto;
  yhteistutkinto: boolean;
  tutkinnot: Tutkinto[];
};

export type PartialHakemus = Partial<Omit<Hakemus, 'asiakirja'>> & {
  asiakirja?: Partial<AsiakirjaTieto>;
};

export type HakemusUpdateCallback = (patch: PartialHakemus) => void;
export type AsiakirjaTietoUpdateCallback = (
  patch: Partial<AsiakirjaTieto>,
  showUpdateIndicator?: boolean,
) => void;

export type AsiakirjaTieto = {
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
  suostumusVahvistamiselleSaatu: boolean;
  valmistumisenVahvistus: ValmistumisenVahvistus;
};

export type InfoText = {
  label?: TranslatedName;
  value?: TranslatedName;
};

export type SisaltoPathNode = SisaltoItem | SisaltoValue;

export type SisaltoItem = {
  key: string;
  fieldType: string;
  value: SisaltoValue[];
  label: TranslatedName;
  children: SisaltoItem[];
  params?: SisaltoItemInfoText;
  previous?: SisaltoPathNode;
  infoText?: InfoText;
};

export type SisaltoValue = {
  label: TranslatedName;
  value: string;
  followups: SisaltoItem[];
  formId?: string;
  previous?: SisaltoPathNode;
};

export type SisaltoItemInfoText = {
  label?: TranslatedName;
  value?: TranslatedName;
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
  imiPyynto: boolean | null;
  imiPyyntoNumero: string | null;
  imiPyyntoLahetetty: string | null;
  imiPyyntoVastattu: string | null;
};

export type ValmistumisenVahvistusVastaus =
  | 'Myonteinen'
  | 'Kielteinen'
  | 'EiVastausta';

export type ValmistumisenVahvistus = {
  valmistumisenVahvistus: boolean;
  valmistumisenVahvistusPyyntoLahetetty: string | null;
  valmistumisenVahvistusSaatu: string | null;
  valmistumisenVahvistusVastaus: ValmistumisenVahvistusVastaus | null;
  valmistumisenVahvistusLisatieto: string | null;
};

export type Tutkinto = {
  id?: string;
  hakemusId: string;
  jarjestys: string;
  nimi?: string;
  oppilaitos?: string;
  aloitusVuosi?: number;
  paattymisVuosi?: number;
  maakoodiUri?: string;
  muuTutkintoTieto?: string;
  todistuksenPaivamaara?: string;
  koulutusalaKoodi?: string;
  paaaaineTaiErikoisala?: string;
  todistusOtsikko?: string;
  muuTutkintoMuistioId?: string;

  ohjeellinenLaajuus?: string;
  opinnaytetyo?: boolean | undefined;
  harjoittelu?: boolean | undefined;
  perustelunLisatietoja?: string | undefined;
};
