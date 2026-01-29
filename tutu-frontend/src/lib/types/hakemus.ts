import {
  Language,
  TranslatedName,
} from '@/src/lib/localization/localizationTypes';
import { Hakija } from '@/src/lib/types/hakija';

export type MuutosHistoriaItem = {
  role: 'Esittelija' | 'Hakija' | 'Irrelevant';
  time: string;
  modifiedBy: string;
};

export enum HakemusKoskee {
  TUTKINNON_TASON_RINNASTAMINEN = 0,
  KELPOISUUS_AMMATTIIN = 1,
  TUTKINTO_SUORITUS_RINNASTAMINEN = 2,
  RIITTAVAT_OPINNOT = 3,
  KELPOISUUS_AMMATTIIN_AP = 4,
  LOPULLINEN_PAATOS = 5,
}

export type Hakemus = {
  hakemusOid: string;
  lomakeOid: string;
  lomakeId: number;
  lomakkeenKieli: Language;
  hakemusKoskee: HakemusKoskee;
  readonly hakija: Hakija;
  asiatunnus: string;
  kirjausPvm: string;
  esittelyPvm: string;
  paatosPvm: string;
  esittelijaOid: string;
  ataruHakemuksenTila: string;
  kasittelyVaihe: string;
  muokattu: string;
  muokkaaja: string;
  muutosHistoria: MuutosHistoriaItem[];
  taydennyspyyntoLahetetty?: string;
  ataruHakemustaMuokattu?: string;
  sisalto: SisaltoItem[];
  liitteidenTilat: TarkistuksenTila[];
  asiakirja: AsiakirjaTieto;
  yhteistutkinto: boolean;
  lopullinenPaatosVastaavaEhdollinenAsiatunnus?: string;
  lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri?: string;
  esittelijanHuomioita?: string;
};

/**
 * Täysi hakemuksen päivityspyyntö.
 * Käytetään PUT-endpointissa kaikkien käyttäjän muokattavien kenttien korvaamiseen.
 * NULL-arvot pyynnössä → NULL tietokantaan.
 */
export type HakemusUpdateRequest = {
  hakemusKoskee: HakemusKoskee;
  asiatunnus: string | null;
  kirjausPvm: string | null;
  esittelyPvm: string | null;
  paatosPvm: string | null;
  esittelijaOid: string | null;
  kasittelyVaihe: string;
  yhteistutkinto: boolean;
  asiakirja: AsiakirjaTieto;
  lopullinenPaatosVastaavaEhdollinenAsiatunnus: string | null;
  lopullinenPaatosVastaavaEhdollinenSuoritusmaaKoodiUri: string | null;
  esittelijanHuomioita: string | null;
};

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
  apHakemus?: boolean | null;
  suostumusVahvistamiselleSaatu: boolean;
  valmistumisenVahvistus: ValmistumisenVahvistus;
  huomiotMuistioon?: string;
  esittelijanHuomioita?: string;
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
  saapumisaika?: string;
};

export type TarkistuksenTila = {
  attachment: string;
  state: string;
  hakukohde: string;
  updateTime?: string;
};

export type AsiakirjaPyynto = {
  id: string;
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
  imiPyynto?: boolean | null;
  imiPyyntoNumero?: string | null;
  imiPyyntoLahetetty?: string | null;
  imiPyyntoVastattu?: string | null;
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
