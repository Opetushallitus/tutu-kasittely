export type YhteinenKasittely = {
  id?: string;
  parentId?: string;
  kysymys?: string;
  vastaus?: string;
  kysymysLuettu?: string | null;
  vastausLuettu?: string | null;
  lahettajaOid?: string;
  vastaanottajaOid?: string;
  vastaanottaja?: string;
  luotu?: string;
  vastattu?: string;
  jatkoKasittelyt?: YhteinenKasittely[];
};

export type YhteinenKasittelyDTO = {
  id: string;
  parentId?: string;
  asiatunnus?: string;
  lahettajaOid: string;
  vastaanottajaOid?: string;
  vastaanottaja?: string;
  luotu: string;
  vastattu?: string;
  kysymysLuettu?: string | null;
  vastausLuettu?: string | null;
  kysymys: string;
  vastaus?: string;
  hakija: string;
  jatkoKasittelyt?: YhteinenKasittely[];
};
