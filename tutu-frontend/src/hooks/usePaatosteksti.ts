export const usePaatosteksti = (hakemusOid: string) => {
  const url = `paatos/${hakemusOid}/paatosteksti/`;

  const getPaatosteksti = (id?: string) => {
    return fetch(url + id);
  };

  const savePaatosteksti = (paatosteksti: string, id?: string) => {
    return fetch(url + id, { body: paatosteksti });
  };

  const getPaatostekstiIds = (): string[] => {
    return [];
  };

  return {
    paatostekstiIds: getPaatostekstiIds(),
    savePaatosteksti,
    getPaatosteksti,
  };
};
