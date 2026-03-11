export type YhteisenKasittelynViesti = {
  hakemusOid: string;
  asiatunnus: string;
  luotu: string;
  lahettajaOid: string;
  lahettaja: string;
  vastaanottajaOid: string;
  vastaanottaja: string;
  hakijanNimi: string;
  viesti: string;
  vastaus?: string;
  luettu?: string;
  status?: number;
};
