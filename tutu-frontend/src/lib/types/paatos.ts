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

export type MyonteinenTaiKielteinenPaatos = {
  myonteinenPaatos?: boolean | null;
  myonteisenPaatoksenLisavaatimukset?:
    | MyonteisenPaatoksenLisavaatimukset
    | KelpoisuudenLisavaatimukset;
  kielteisenPaatoksenPerustelut?: KielteisenPaatoksenPerustelut;
};

export type PaatosTieto = {
  id?: string;
  paatosId: string;
  paatosTyyppi?: Paatostyyppi;
  sovellettuLaki?: SovellettuLaki;
  tutkintoId?: string;
  lisaaTutkintoPaatostekstiin?: boolean;
  tutkintoTaso?: TutkintoTaso;
  rinnastettavatTutkinnotTaiOpinnot: TutkintoTaiOpinto[];
  kelpoisuudet: Kelpoisuus[];
} & Omit<MyonteinenTaiKielteinenPaatos, 'myonteisenPaatoksenLisavaatimukset'>;

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

export type TutkintoTaiOpinto = {
  id?: string;
  paatostietoId?: string;
  tutkintoTaiOpinto?: string;
  opetuskieli?: string;
} & MyonteinenTaiKielteinenPaatos;

export type MyonteisenPaatoksenLisavaatimukset = {
  taydentavatOpinnot: boolean;
  kelpoisuuskoe: boolean;
  sopeutumisaika: boolean;
};

export type MyonteisenPaatoksenLisavaatimusUpdateCallback = (
  lisavaatimukset: Partial<
    MyonteisenPaatoksenLisavaatimukset | KelpoisuudenLisavaatimukset
  >,
) => void;

export type KelpoisuudenLisavaatimukset = {
  olennaisiaEroja?: boolean | null;
  erotAineenopettajanKoulutuksessa?: ErotAineenopettajanKoulutuksessa;
  korvaavaToimenpide?: KorvaavaToimenpide;
  ammattikokemusJaElinikainenOppiminen?: AmmattikokemusJaElinikainenOppiminen;
};

export type ErotAineenopettajanKoulutuksessa = {
  eroOpetettavanAineenOpinnoissa?: boolean;
  eroPedagogisissaOpinnoissa?: boolean;
  syventavienOpintojenPuuttuminen?: boolean;
  eriIkaryhma?: boolean;
  muu?: boolean;
  muuKuvaus?: string;
};

export type KelpoisuuskoeSisalto = {
  aihealue1?: boolean;
  aihealue2?: boolean;
  aihealue3?: boolean;
};

export type KorvaavaToimenpide = {
  taydentavatOpinnot?: boolean;
  kelpoisuuskoe?: boolean;
  kelpoisuuskoeSisalto?: KelpoisuuskoeSisalto;
  sopeutumisaika?: boolean;
  sopeutumiusaikaKestoKk?: string;
  kelpoisuuskoeJaSopeutumisaika?: boolean;
};

export type AmmattikokemusJaElinikainenOppiminenKorvaavuus =
  | 'Taysi'
  | 'Osittainen'
  | 'Ei';

export type AmmattikokemusJaElinikainenOppiminen = {
  ammattikokemus?: boolean;
  elinikainenOppiminen?: boolean;
  lisatieto?: string;
  korvaavuus?: AmmattikokemusJaElinikainenOppiminenKorvaavuus | null;
  korvaavaToimenpide?: KorvaavaToimenpide;
};

export type KielteisenPaatoksenPerustelut = {
  epavirallinenKorkeakoulu?: boolean;
  epavirallinenTutkinto?: boolean;
  eiVastaaSuomessaSuoritettavaaTutkintoa?: boolean;
  muuPerustelu?: boolean;
  muuPerusteluKuvaus?: string;
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

export type KelpoisuusUpdateCallback = (
  kelpoisuus: Partial<Kelpoisuus>,
) => void;

export type Kelpoisuus = {
  id?: string;
  paatostietoId?: string;
  kelpoisuus?: string;
  muuAmmattiKuvaus?: string;
  opetettavaAine?: string;
  direktiivitaso?: Direktiivitaso;
  kansallisestiVaadittavaDirektiivitaso?: Direktiivitaso;
  direktiivitasoLisatiedot?: string;
} & MyonteinenTaiKielteinenPaatos;
