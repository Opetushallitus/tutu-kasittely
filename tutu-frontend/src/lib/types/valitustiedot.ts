export type ValitusOPH = {
  maksu?: boolean;
  asiavirhe?: boolean;
  kirjoitusvirhe?: boolean;
  muu?: boolean;
  tasmennys?: string;
};

export type ValitusHaORatkaisu =
  | 'VaatimusHylatty'
  | 'UudelleenKasittely'
  | 'ErilainenPaatos'
  | 'KasittelyRauennut';

export type ValitusLausuntopyynto = {
  ashaTunnus?: string;
  saapumisPvm?: string | null;
  maaraAikaPvm?: string | null;
  lausuntoAnnettuPvm?: string | null;
};

export type ValitusHaOValittajanVaatimus = {
  taso?: boolean;
  suuntautuminen?: boolean;
  virallisuus?: boolean;
  tiettyKelpoisuus?: boolean;
  kompensaationPoistoTaiVahennysAP?: boolean;
  kompensaationPoistoTaiVahennysUO?: boolean;
  muu?: boolean;
  tasmennys?: string;
};

export type ValitusHaO = {
  valitettu?: boolean;
  valitusPvm?: string | null;
  ratkaisuPvm?: string | null;
  lausuntopyyntoValittu?: boolean;
  lausuntopyynto?: ValitusLausuntopyynto | null;
  valittajanVaatimus?: ValitusHaOValittajanVaatimus | null;
  ratkaisu?: ValitusHaORatkaisu | null;
  ratkaisuLisatieto?: string | null;
};

export type ValitusKHORatkaisu =
  | 'EiValituslupaa'
  | 'HakijanVaatimusHylatty'
  | 'UudelleenOPHKasittelyyn'
  | 'KhoErilainenPaatos'
  | 'KhoKasittelyRauennut';

export type ValitusKHO = {
  valitettu?: boolean;
  valitusPvm?: string | null;
  ratkaisuPvm?: string | null;
  lausuntopyyntoValittu?: boolean;
  lausuntopyynto?: ValitusLausuntopyynto | null;
  ratkaisu?: ValitusKHORatkaisu | null;
  ratkaisuLisatieto?: string | null;
};

export type Valitustiedot = {
  id?: string;
  hakemusId?: string;
  valitusOPH: ValitusOPH;
  valitusHaO: ValitusHaO;
  valitusKHO: ValitusKHO;
  luoja?: string;
  luotu?: string;
  muokkaaja?: string;
  muokattu?: string;
};
