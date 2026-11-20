import { YkViestiTyyppi } from '@/src/lib/types/yhteinenkasittely';

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
  tyyppi: YkViestiTyyppi;
};

export type YKKysymysDTO = {
  id?: string;
  parentId?: string;
  viesti?: string;
  vastaanottajaOid?: string;
  laheta?: boolean;
  aihe?: string;
  tyyppi: YkViestiTyyppi;
};

export type YKVastausDTO = {
  id?: string;
  parentId?: string;
  vastaus?: string;
  laheta?: boolean;
  tyyppi: YkViestiTyyppi;
};
