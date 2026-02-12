export type YhteinenKasittely = {
  id?: string;
  parentId?: string;
  kysymys?: string;
  vastaus?: string;
  lahettaja?: string;
  vastaanottaja?: string;
  luotu?: string;
  jatkoKasittelyt?: YhteinenKasittely[];
};
