export type YhteisenKasittelynViesti = {
  id: string;
  hakemusOid: string;
  asiatunnus?: string | null;
  aihe?: string | null;
  esittelija?: string | null;
  luotu?: string | null;
  lahettajaOid?: string | null;
  lahettaja?: string | null;
  vastaanottajaOid?: string | null;
  viesti?: string | null;
  luettu?: boolean;
  status?: string | null;
};
