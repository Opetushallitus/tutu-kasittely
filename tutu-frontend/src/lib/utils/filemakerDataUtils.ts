export type FilemakerHakemus = {
  id: string | undefined;
  Etunimet: string | undefined;
  Sukunimi: string | undefined;
  Henkilötunnus: string | undefined;
  Asiatunnus: string | undefined;
  Mita_haet: string | undefined;
  'Hakemus kirjattu': string | undefined;
  spss_esittelypvm: string | undefined;
  ashateksti_paatos: string | undefined;
  muistio_koonti_uusi_kaikki: string | undefined;
};

const getters: {
  [key: string]: (data: FilemakerHakemus) => string | undefined;
} = {};

getters.etunimi = (data: FilemakerHakemus) => data?.['Etunimet'];
getters.sukunimi = (data: FilemakerHakemus) => data?.['Sukunimi'];
getters.kokonimi = (data: FilemakerHakemus) =>
  `${getters.sukunimi(data)}, ${getters.etunimi(data)}`.trim();
getters.hetu = (data: FilemakerHakemus) => data?.['Henkilötunnus'];
getters.asiatunnus = (data: FilemakerHakemus) => data?.['Asiatunnus'];
getters.hakemusKoskee = (data: FilemakerHakemus) => data?.['Mita_haet'];
getters.kirjauspvm = (data: FilemakerHakemus) => data?.['Hakemus kirjattu'];
getters.esittelypvm = (data: FilemakerHakemus) => data?.['spss_esittelypvm'];
getters.paatosteksti = (data: FilemakerHakemus) => data?.['ashateksti_paatos'];
getters.perustelumuistioteksti = (data: FilemakerHakemus) =>
  data?.['muistio_koonti_uusi_kaikki'];

export { getters };
