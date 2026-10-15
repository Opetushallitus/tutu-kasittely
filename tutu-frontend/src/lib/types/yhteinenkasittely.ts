export type Viesti = {
  id?: string;
  parentId?: string;
  asiatunnus?: string;
  lahettajaOid?: string;
  lahettaja?: string;
  vastaanottajaOid?: string;
  vastaanottaja?: string;
  luotu?: string;
  luettu?: string[] | null;
  viesti: string;
  hakija?: string;
  aihe?: string;
};

export type LahtevaViesti = {
  parentId: string;
  viesti: string;
  vastaanottajOid: string;
  aihe?: string;
};

export type YhteinenKasittely = {
  aloitusViesti: Viesti;
  jatkoKasittelyt?: Viesti[];
};

export type YhteinenKasittelyDTO = {
  aloitusViesti: Viesti;
  jatkoKasittelyt?: Viesti[];
};
