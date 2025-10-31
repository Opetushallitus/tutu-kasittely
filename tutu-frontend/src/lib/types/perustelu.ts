import { UoRoSisalto } from '@/src/lib/types/perusteluUoRo';
import { Lausuntopyynto } from '@/src/lib/types/lausuntotieto';
import { APSisalto } from '@/src/lib/types/APSisalto';

export type Perustelu = {
  id: string;
  hakemusId: string;
  virallinenTutkinnonMyontaja?: boolean | null;
  virallinenTutkinto?: boolean | null;
  lahdeLahtomaanKansallinenLahde: boolean;
  lahdeLahtomaanVirallinenVastaus: boolean;
  lahdeKansainvalinenHakuteosTaiVerkkosivusto: boolean;
  selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: string;
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa?: string | null;
  selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: string;
  luotu: string;
  luoja: string;
  muokattu?: string;
  muokkaaja?: string;
  uoRoSisalto?: UoRoSisalto;
  jatkoOpintoKelpoisuus?: string | null;
  jatkoOpintoKelpoisuusLisatieto?: string;
  muuPerustelu?: string;
  aikaisemmatPaatokset?: boolean | null;
  apSisalto?: APSisalto;
  lausuntoPyyntojenLisatiedot?: string;
  lausunnonSisalto?: string;
  lausuntopyynnot: Lausuntopyynto[];
};

export type VirallinenTutkinnonMyontajaWrapper = {
  virallinenTutkinnonMyontaja?: boolean | null;
};

export type VirallinenTutkintoWrapper = {
  virallinenTutkinto?: boolean | null;
};

export type AikaisemmatPaatoksetWrapper = {
  aikaisemmatPaatokset?: boolean | null;
};
