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

export type ValitusKHO = {
  tasmennys?: string;
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
