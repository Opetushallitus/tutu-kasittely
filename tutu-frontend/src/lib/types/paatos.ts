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
};

export type Paatos = {
  id?: string;
  ratkaisutyyppi?: Ratkaisutyyppi;
  seutArviointi: boolean;
  peruutuksenTaiRaukeamisenSyy?: PeruutuksenTaiRaukeamisenSyy;
  paatosTiedot?: PaatosTieto[];
};

export type PaatosUpdateCallback = (paatos: Paatos) => void;
