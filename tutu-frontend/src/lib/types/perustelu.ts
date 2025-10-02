import { UoRoSisalto } from '@/src/lib/types/perusteluUoRo';
import { Lausuntopyynto } from '@/src/lib/types/lausuntotieto';

export type Perustelu = {
  id: string;
  hakemusId: string;
  virallinenTutkinnonMyontaja?: boolean | null;
  virallinenTutkinto?: boolean | null;
  lahdeLahtomaanKansallinenLahde: boolean;
  lahdeLahtomaanVirallinenVastaus: boolean;
  lahdeKansainvalinenHakuteosTaiVerkkosivusto: boolean;
  selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: string;
  ylimmanTutkinnonAsemaLahtomaanJarjestelmassa?: string;
  selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: string;
  luotu: string;
  luoja: string;
  muokattu?: string;
  muokkaaja?: string;
  uoRoSisalto?: UoRoSisalto;
  jatkoOpintoKelpoisuus?: string;
  jatkoOpintoKelpoisuusLisatieto?: string;
  muuPerustelu?: string;
  aikaisemmatPaatokset?: boolean;
  lausuntoPyyntojenLisatiedot?: string;
  lausunnonSisalto?: string;
  lausuntopyynnot: Lausuntopyynto[];
};
