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
  kielteisenPaatoksenPerustelut: string;
  tutkintoId?: string;
  lisaaTutkintoPaatostekstiin?: boolean;
  myonteinenPaatos?: boolean;
  tutkintoTaso?: TutkintoTaso;
  rinnastettavatTutkinnotTaiOpinnot: TutkintoTaiOpinto[];
};

export type Paatos = {
  id?: string;
  ratkaisutyyppi?: Ratkaisutyyppi;
  seutArviointi: boolean;
  peruutuksenTaiRaukeamisenSyy?: PeruutuksenTaiRaukeamisenSyy;
  paatosTiedot?: PaatosTieto[];
  paatosTietoOptions: PaatosTietoOptionGroup;
};

export type PaatosUpdateCallback = (paatos: Paatos) => void;

export type TutkintoTaiOpinto = {
  id?: string;
  paatostietoId?: string;
  tutkintoTaiOpinto?: string;
  myonteinenPaatos?: boolean;
  myonteisenPaatoksenLisavaatimukset?: string;
  kielteisenPaatoksenPerustelut?: string;
};

export type PaatosTietoOptionGroup = {
  kelpoisuusOptions: PaatosTietoOption[];
  riittavatOpinnotOptions: PaatosTietoOption[];
  tiettyTutkintoTaiOpinnotOptions: PaatosTietoOption[];
};

export type PaatosTietoOption = {
  label: { fi: string; en: string; sv: string };
  value: { fi: string; en: string; sv: string };
  children?: PaatosTietoOption[];
};
