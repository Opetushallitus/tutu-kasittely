import { PerusteluUoRo } from '@/src/lib/types/perusteluUoRo';

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
  perusteluUoRo?: PerusteluUoRo;
};
