import { UoRoSisalto } from '@/src/lib/types/perusteluUoRo';
import { Lausuntopyynto } from '@/src/lib/types/lausuntotieto';

export type Perustelu = {
  id: string;
  hakemusId: string;
  virallinenTutkinnonMyontaja?: boolean | undefined | null;
  virallinenTutkinto?: boolean | undefined | null;
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
  jatkoOpintoKelpoisuus?: string | undefined;
  jatkoOpintoKelpoisuusLisatieto?: string | undefined;
  muuPerustelu: string;
  aikaisemmatPaatokset?: boolean | undefined;
  lausuntoPyyntojenLisatiedot?: string;
  lausunnonSisalto?: string;
  lausuntopyynnot: Lausuntopyynto[];
};
