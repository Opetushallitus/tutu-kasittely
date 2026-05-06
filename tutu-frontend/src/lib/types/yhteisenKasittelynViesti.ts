export type YhteisenKasittelynViesti = {
  id: string;
  hakemusOid: string;
  asiatunnus?: string | null;
  luotu?: string | null;
  lahettajaOid?: string | null;
  lahettaja?: string | null;
  vastaanottajaOid?: string | null;
  vastaanottaja?: string | null;
  hakija: string;
  kysymys: string;
  vastaus?: string | null;
  kysymysLuettu?: string | null;
  vastausLuettu?: string | null;
  status?: string | null;
};
