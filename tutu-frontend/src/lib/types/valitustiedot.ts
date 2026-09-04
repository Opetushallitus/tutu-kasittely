export type ValitusOPH = {
  maksu?: boolean;
  asiavirhe?: boolean;
  kirjoitusvirhe?: boolean;
  muu?: boolean;
  tasmennys?: string;
};

export type ValitusHO = {
  tasmennys?: string;
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
  ratkaisu?: ValitusKHORatkaisu;
  ratkaisuLisatieto?: string;
};

export type Valitustiedot = {
  id?: string;
  hakemusId?: string;
  valitusOPH: ValitusOPH;
  valitusHO: ValitusHO;
  valitusKHO: ValitusKHO;
  luoja?: string;
  luotu?: string;
  muokkaaja?: string;
  muokattu?: string;
};
