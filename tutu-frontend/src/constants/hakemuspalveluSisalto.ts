export type HakemuspalveluSisaltoId = {
  generatedId: string;
  definedId: string;
};

const createId = (
  generatedId: string,
  definedId: string,
): HakemuspalveluSisaltoId => {
  return { generatedId, definedId };
};

// Tietojen oikeellisuus ja todistusten aitous
export const oikeellisuusJaAitous: HakemuspalveluSisaltoId = createId(
  '9e94bfe6-5855-43fc-bd80-d5b74741decb',
  'oikeellisuus-ja-aitous',
);

export const perustietoOsiot = [
  createId('89e89dff-25b2-4177-b078-fcaf0c9d2589', 'tutkinto-tai-koulutus'),
  createId('0d23f1d1-1aa5-4dcb-9234-28c593441935', 'paatos-ja-asiointikieli'),
  createId(
    '3781f43c-fff7-47c7-aa7b-66f4a47395a5',
    'paatoksen-lahettaminen-sahkopostilla',
  ),
  oikeellisuusJaAitous,
];

export const todistusAitoustarkistusLupa: HakemuspalveluSisaltoId = createId(
  'c20bb2dc-fc8c-41a9-8897-b08fbfc3c705',
  'todistus-aitoustarkistus-lupa',
);
