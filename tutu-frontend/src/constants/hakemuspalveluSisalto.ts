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

export const ylinTutkinto: HakemuspalveluSisaltoId = createId(
  'f1882e83-2836-440d-a197-4950571e798a',
  'ylin-tutkinto',
);

export const alemmatTutkinnot: HakemuspalveluSisaltoId = createId(
  '216fb38b-7864-4eec-84be-356b420c9167',
  'alemmat-tutkinnot',
);

export const muutTutkinnot: HakemuspalveluSisaltoId = createId(
  '142b4364-1b26-4c95-a98c-d500edf2fcfa',
  'muut-tutkinnot',
);
export const perustiedot: HakemuspalveluSisaltoId = createId(
  '68afefd2-daff-4d74-857c-1736a54eab1b',
  'hakemuksen-perustiedot',
);

export const perustietoOsiot = [
  perustiedot,
  // ylinTutkinto,
  // alemmatTutkinnot,
  // tutkintoTaiKoulutus,
  // paatosJaAsiointikieli,
  // createId(
  //   '3781f43c-fff7-47c7-aa7b-66f4a47395a5',
  //   'paatoksen-lahettaminen-sahkopostilla',
  // ),
  // oikeellisuusJaAitous,
];

export const todistusAitoustarkistusLupa: HakemuspalveluSisaltoId = createId(
  'c20bb2dc-fc8c-41a9-8897-b08fbfc3c705',
  'todistus-aitoustarkistus-lupa',
);

export const henkilotietojenLiitteet: HakemuspalveluSisaltoId = createId(
  'c3b22d35-514f-4cf6-9a89-dcdba6aedb55',
  'henkilotietojen-liitteet',
);
