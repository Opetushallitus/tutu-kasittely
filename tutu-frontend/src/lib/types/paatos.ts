import { TranslatedName } from '@/src/lib/localization/localizationTypes';

export type Ratkaisutyyppi =
  | 'Paatos'
  | 'PeruutusTaiRaukeaminen'
  | 'Oikaisu'
  | 'JatetaanTutkimatta'
  | 'Siirto';

export type Paatostyyppi =
  | 'Taso'
  | 'Kelpoisuus'
  | 'TiettyTutkintoTaiOpinnot'
  | 'RiittavatOpinnot';

export type SovellettuLaki = 'uo' | 'ap' | 'ap_seut' | 'ro';

export type TutkintoTaso = 'AlempiKorkeakoulu' | 'YlempiKorkeakoulu';

export type PeruutuksenTaiRaukeamisenSyy = {
  eiSaaHakemaansaEikaHaluaPaatostaJonkaVoisiSaada?: boolean;
  muutenTyytymatonRatkaisuun?: boolean;
  eiApMukainenTutkintoTaiHaettuaPatevyytta?: boolean;
  eiTasoltaanVastaaSuomessaSuoritettavaaTutkintoa?: boolean;
  epavirallinenKorkeakouluTaiTutkinto?: boolean;
  eiEdellytyksiaRoEikaTasopaatokselle?: boolean;
  eiEdellytyksiaRinnastaaTiettyihinKkOpintoihin?: boolean;
  hakijallaJoPaatosSamastaKoulutusKokonaisuudesta?: boolean;
  muuSyy?: boolean;
};

export type PaatosTieto = {
  id?: string;
  paatosId: string;
  paatosTyyppi?: Paatostyyppi;
  sovellettuLaki?: SovellettuLaki;
  myonteisenPaatoksenLisavaatimukset: string;
  kielteisenPaatoksenPerustelut?: KielteisenPaatoksenPerustelut;
  tutkintoId?: string;
  lisaaTutkintoPaatostekstiin?: boolean;
  myonteinenPaatos?: boolean;
  tutkintoTaso?: TutkintoTaso;
  rinnastettavatTutkinnotTaiOpinnot: TutkintoTaiOpinto[];
  kelpoisuudet: Kelpoisuus[];
};

export type Paatos = {
  id?: string;
  ratkaisutyyppi?: Ratkaisutyyppi;
  seutArviointi: boolean;
  peruutuksenTaiRaukeamisenSyy?: PeruutuksenTaiRaukeamisenSyy;
  paatosTiedot?: PaatosTieto[];
  paatosTietoOptions: PaatosTietoOptionGroup;
  hyvaksymispaiva: string | null;
  lahetyspaiva: string | null;
};

export type PaatosUpdateCallback = (paatos: Paatos) => void;

export type TutkintoTaiOpinto = {
  id?: string;
  paatostietoId?: string;
  tutkintoTaiOpinto?: string;
  myonteinenPaatos?: boolean;
  myonteisenPaatoksenLisavaatimukset: MyonteisenPaatoksenLisavaatimukset;
  kielteisenPaatoksenPerustelut?: string;
};

export type MyonteisenPaatoksenLisavaatimukset = {
  taydentavatOpinnot: boolean;
  kelpoisuuskoe: boolean;
  sopeutumisaika: boolean;
};

export type KielteisenPaatoksenPerustelut = {
  epavirallinenKorkeakoulu: boolean;
  epavirallinenTutkinto: boolean;
  eiVastaaSuomessaSuoritettavaaTutkintoa: boolean;
  muuPerustelu: boolean;
};

export type PaatosTietoOptionGroup = {
  kelpoisuusOptions: PaatosTietoOption[];
  riittavatOpinnotOptions: PaatosTietoOption[];
  tiettyTutkintoTaiOpinnotOptions: PaatosTietoOption[];
};

export type PaatosTietoOption = {
  label: TranslatedName;
  value: TranslatedName;
  children?: PaatosTietoOption[];
};

export type Direktiivitaso =
  | 'a_1384_2015_patevyystaso_1'
  | 'b_1384_2015_patevyystaso_2'
  | 'c_1384_2015_patevyystaso_3'
  | 'd_1384_2015_patevyystaso_4'
  | 'e_1384_2015_patevyystaso_5';

export type Kelpoisuus = {
  id?: string;
  paatostietoId?: string;
  kelpoisuus?: string;
  muuAmmmattikuvaus?: string;
  opetettavaAine?: string;
  direktiivitaso?: Direktiivitaso;
  kansallisestiVaadittavaDirektiivitaso?: Direktiivitaso;
  direktiivitasoLisatiedot?: string;
  myonteinenPaatos?: boolean;
  myonteisenPaatoksenLisavaatimukset?: string;
  kielteisenPaatoksenPerustelut?: string;
};
