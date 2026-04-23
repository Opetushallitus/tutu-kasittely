export type YhteinenKasittely = {
  id?: string;
  parentId?: string;
  kysymys?: string;
  vastaus?: string;
  lahettaja?: string;
  vastaanottaja?: string;
  luotu?: string;
  jatkoKasittelyt?: YhteinenKasittely[];
};

export type YhteinenKasittelyDTO = {
  id: string;
  parentId?: string;
  asiatunnus?: string;
  lahettajaOid: string;
  vastaanottajaOid?: string;
  luotu: string;
  luettu?: string;
  kysymys: string;
  vastaus?: string;
  hakija: string;
};
