import {
  ValitusLausuntopyynto,
  Valitustiedot,
} from '@/src/lib/types/valitustiedot';

// Vastaa backendin palauttamaa oletusmuotoa, kun valitustietoja ei ole vielä tallennettu
const tyhjaLausuntopyynto = (): ValitusLausuntopyynto => ({
  ashaTunnus: null,
  saapumisPvm: null,
  maaraAikaPvm: null,
  lausuntoAnnettuPvm: null,
});

export const getValitustiedot = (): Valitustiedot => ({
  valitusOPH: {
    maksu: false,
    asiavirhe: false,
    kirjoitusvirhe: false,
    muu: false,
    tasmennys: null,
  },
  valitusHaO: {
    valitettu: false,
    valitusPvm: null,
    ratkaisuPvm: null,
    lausuntopyyntoValittu: false,
    lausuntopyynto: tyhjaLausuntopyynto(),
    valittajanVaatimus: {
      taso: false,
      suuntautuminen: false,
      virallisuus: false,
      tiettyKelpoisuus: false,
      kompensaationPoistoTaiVahennysAP: false,
      kompensaationPoistoTaiVahennysUO: false,
      muu: false,
      tasmennys: null,
    },
    ratkaisu: null,
    ratkaisuLisatieto: null,
  },
  valitusKHO: {
    valitettu: false,
    valitusPvm: null,
    ratkaisuPvm: null,
    ratkaisu: null,
    ratkaisuLisatieto: null,
    lausuntopyyntoValittu: false,
    lausuntopyynto: tyhjaLausuntopyynto(),
  },
});
