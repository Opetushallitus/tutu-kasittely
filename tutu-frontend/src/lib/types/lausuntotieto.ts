export type Lausuntotieto = {
  id?: string;
  lausuntopyynnot: Lausuntopyynto[];
  pyyntojenLisatiedot: string | null;
  sisalto: string | null;
};

export type Lausuntopyynto = {
  jarjestys: number;
  lausunnonAntaja: string | null;
  lahetetty: string | null;
  saapunut: string | null;
};
