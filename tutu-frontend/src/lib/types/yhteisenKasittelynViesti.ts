export type YhteisenKasittelynViesti = {
  hakemusOid: string;
  asiatunnus: string;
  lahetysPvm: string;
  lahettajaOid: string;
  lahettaja: string;
  vastaanottajaOid: string;
  vastaanottaja: string;
  hakijanNimi: string;
  viesti: string;
  vastaus?: string;
};
