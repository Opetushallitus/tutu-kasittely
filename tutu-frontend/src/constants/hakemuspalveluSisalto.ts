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

export const paatosJaAsiointikieli: HakemuspalveluSisaltoId = createId(
  '0d23f1d1-1aa5-4dcb-9234-28c593441935',
  'paatos-ja-asiointikieli',
);
export const paatosKieli: HakemuspalveluSisaltoId = createId(
  '82c7260d-ebf0-4521-8f18-ad37e5490670',
  'paatos-kieli',
);
export const asiointiKieli: HakemuspalveluSisaltoId = createId(
  '9b5f4057-0b3e-45ae-827d-12d877822d4a',
  'asiointi-kieli',
);

// Tietojen oikeellisuus ja todistusten aitous
export const oikeellisuusJaAitous: HakemuspalveluSisaltoId = createId(
  '9e94bfe6-5855-43fc-bd80-d5b74741decb',
  'oikeellisuus-ja-aitous',
);

export const tutkintoTaiKoulutus: HakemuspalveluSisaltoId = createId(
  '89e89dff-25b2-4177-b078-fcaf0c9d2589',
  'tutkinto-tai-koulutus',
);

export const perustietoOsiot = [
  tutkintoTaiKoulutus,
  paatosJaAsiointikieli,
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

/*
ea25df4f-52a8-4540-83b7-19dffdd353f7 -> tutu-first-degree-name
f79acf0e-d410-4948-9e0a-84596b092d32 -> tutu-first-degree-school
7812a33b-1ea5-4b67-918a-660f0a1a4e22 -> tutu-first-degree-start-year
b6b2fc1f-2749-42d1-823a-4b4a33fe30b6 -> tutu-first-degree-end-year

d7eb503d-44f0-4445-8eb1-5e65c22fe764 -> tutu-second-degree-name
f369367d-300a-4b36-b19b-91f3f72c841d -> tutu-second-degree-school
38a35cad-743b-43b8-96d1-e75c9674cc5e -> tutu-second-degree-country
a76d09cf-a214-4abd-be63-cbbe63a5897b -> tutu-second-degree-start-year
58345eb0-8179-4f5f-beb8-ef8397a63e8c -> tutu-second-degree-end-year

8a75125b-0677-4695-b76a-ed058a602b0a -> tutu-third-degree-name
3feb11ad-354e-443f-9bcf-4cb23ca8079f -> tutu-third-degree-school
cd00fb20-b4de-4a6a-888e-0aae2c0fb49d -> tutu-third-degree-country
8b30c1ab-885b-4989-ba1c-58b391ef35a7 -> tutu-third-degree-start-year
b7b38bf4-12bb-4e58-9399-4fb59fdb326e -> tutu-third-degree-end-year

743fd221-6ec7-40d8-9758-7786e7ff2458 -> tutu-other-degree-text
 */
