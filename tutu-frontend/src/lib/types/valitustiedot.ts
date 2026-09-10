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
  saapumisPvm?: string;
  maaraAikaPvm?: string;
  lausuntoAnnettuPvm?: string;
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
  valitusPvm?: string;
  ratkaisuPvm?: string;
  lausuntopyyntoValittu?: boolean;
  lausuntopyynto?: ValitusLausuntopyynto;
  valittajanVaatimus?: ValitusHaOValittajanVaatimus;
  ratkaisu?: ValitusHaORatkaisu;
  ratkaisuLisatieto?: string;
};

export type ValitusKHORatkaisu =
  | 'EiValituslupaa'
  | 'HakijanVaatimusHylatty'
  | 'UudelleenOPHKasittelyyn'
  | 'KhoErilainenPaatos'
  | 'KhoKasittelyRauennut';

export type ValitusKHO = {
  valitettu?: boolean;
  valitusPvm?: string;
  ratkaisuPvm?: string;
  lausuntopyyntoValittu?: boolean;
  lausuntopyynto?: ValitusLausuntopyynto;
  ratkaisu?: ValitusKHORatkaisu;
  ratkaisuLisatieto?: string;
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
