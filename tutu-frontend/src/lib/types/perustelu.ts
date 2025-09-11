import { PerusteluUoRo } from '@/src/lib/types/perusteluUoRo';
import { Lausuntotieto } from '@/src/lib/types/lausuntotieto';

export type Perustelu = {
  id: string;
  hakemusId: string;
  virallinenTutkinnonMyontaja?: boolean | undefined;
  virallinenTutkinto?: boolean | undefined;
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
  lausuntotieto?: Lausuntotieto;
  perusteluUoRo?: PerusteluUoRo;
};
