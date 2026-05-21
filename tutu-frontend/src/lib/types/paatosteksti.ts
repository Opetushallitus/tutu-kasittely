export type Paatosteksti = {
  id?: string;
  hakemusId: string;
  vahvistettu?: string;
  sisalto: string;
  luotu: string;
  muokattu?: string;
  luoja: string;
  muokkaaja?: string;
};

export type Paatospohja = {
  id?: string;
  sisalto: {
    fi?: string;
    sv?: string;
  };
  nimi: string;
  kategoriaId?: string;
  luotu?: string | null;
  luoja?: string | null;
  muokattu?: string | null;
  muokkaaja?: string | null;
};

export type PaatospohjaListItem = {
  id: string;
  kategoriaId?: string;
  nimi: string;
};

export type PaatospohjaKategoria = {
  id?: string;
  nimi: string;
};
