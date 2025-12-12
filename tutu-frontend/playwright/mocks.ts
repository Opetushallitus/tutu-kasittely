import { Route, Page } from '@playwright/test';
import { readFile } from 'fs/promises';
import path from 'path';
import { sortBy } from 'remeda';
import { getLiitteet } from '@/playwright/fixtures/hakemus1';
import { _sisalto } from './fixtures/hakemus1/_sisalto';
import { Language } from '@/src/lib/localization/localizationTypes';
import { getPaatos } from '@/playwright/fixtures/paatos1';
import { getLopullinenHakemus } from '@/playwright/fixtures/hakemus2';

export const mockAll = async ({ page }: { page: Page }) => {
  await Promise.all([
    mockInit(page),
    mockEsittelijat(page),
    mockHakemusLista(page),
    mockUser(page),
    mockHakemus(page),
    mockPerustelu(page),
    mockLiitteet(page),
    mockKoodistot(page),
  ]);
};

export const mockBasicForLista = async ({ page }: { page: Page }) => {
  await mockInit(page);
};

export const mockSuccessfullLists = async ({ page }: { page: Page }) => {
  await Promise.all([
    mockEsittelijat(page),
    mockHakemusLista(page),
    mockUser(page),
  ]);
};

export const mockBasicForHakemus = async ({ page }: { page: Page }) => {
  await Promise.all([mockInit(page), mockEsittelijat(page)]);
};

export const mockInit = async (page: Page) => {
  await page.route('**/tutu-backend/api/csrf', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        parameterName: '_csrf',
        token:
          'Gbt6oz01mVW5QV7XQ-hz_5P6BKJ_qkPb0xhjx6ZiW8uYyAnhKotKklkFqjGUJz-0dMVHyqqZKZscnSL24SsBpMRQOvn-rTCF',
        headerName: 'X-CSRF-TOKEN',
      }),
    });
  });
  await page.route('**/tutu-backend/api/session', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        empty: false,
        traversableAgain: true,
      }),
    });
  });
};

export const mockEsittelijat = async (page: Page) => {
  await page.route('**/tutu-backend/api/esittelijat*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: await readFile(path.join(__dirname, './fixtures/esittelijat.json')),
    });
  });
};

export const mockHakemusLista = async (page: Page) => {
  await page.route(
    '**/tutu-backend/api/hakemuslista*',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: await readFile(
          path.join(__dirname, './fixtures/hakemukset.json'),
        ),
      });
    },
  );
};

export const mockUser = async (page: Page, kieli: string = 'fi') => {
  await page.route('**/tutu-backend/api/user', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          userOid: '1.2.246.562.24.999999999999',
          authorities: [
            'ROLE_APP_TUTU_ESITTELIJA',
            'ROLE_APP_TUTU_ESITTELIJA_1.2.246.562.10.00000000001',
          ],
          asiointikieli: kieli,
        },
      }),
    });
  });
};

export const mockHakemus = async (
  page: Page,
  lomakkeenKieli: Language = 'fi',
) => {
  await page.route('**/tutu-backend/api/hakemus/*', async (route: Route) => {
    const url = route.request().url();
    const params = url.split('/').pop()?.split('?') || [];
    const oid = params[0];
    const isDescMuutoshistoriaSortOrder = (params[1] || '').includes(
      'hakemusMuutoshistoriaSort=desc',
    );
    const muutosHistoriaRaw = [
      {
        role: 'Esittelija',
        time: '2025-05-28T10:59:47.597',
        modifiedBy: 'Esittelija Testi',
      },
      {
        role: 'Hakija',
        time: '2025-06-15T15:14:47.597',
        modifiedBy: 'Hakija Testi',
      },
    ];

    const muutoshistoria = isDescMuutoshistoriaSortOrder
      ? sortBy(muutosHistoriaRaw, (mh) => mh.time).reverse()
      : muutosHistoriaRaw;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        hakemusOid: oid,
        lomakeOid: '74825f61-e561-447e-bef4-1bb5be4ea44a',
        lomakeId: 12345,
        lomakkeenKieli: lomakkeenKieli,
        hakija: {
          etunimet: 'Heikki Hemuli',
          kutsumanimi: 'Hessu',
          sukunimi: 'Heittotähti',
          kansalaisuus: [
            {
              fi: 'Suomi',
              sv: 'Finland',
              en: 'Finland',
            },
            {
              fi: 'Ruotsi',
              sv: 'Ruåtsi',
              en: 'Sweden',
            },
          ],
          hetu: '121280-123A',
          syntymaaika: '1980-01-01',
          matkapuhelin: '0401234567',
          asuinmaa: {
            fi: 'Suomi',
            sv: 'Finland',
            en: 'Finland',
          },
          katuosoite: 'Helsinginkatu 1',
          postinumero: '00100',
          postitoimipaikka: 'Helsinki',
          kotikunta: {
            fi: 'Helsinki',
            sv: 'Helsingfors',
          },
          sahkopostiosoite: 'hessu@hemuli.com',
        },
        asiatunnus: 'OPH-111-2025',
        kirjausPvm: '2025-05-14T10:59:47.597',
        esittelyPvm: '2025-05-28T10:59:47.597',
        paatosPvm: '2025-05-28T10:59:47.597',
        esittelijaOid: '1.2.246.562.24.999999999999',
        ataruHakemuksenTila: 'kasittelymaksamatta',
        kasittelyVaihe: 'HakemustaTaydennetty',
        muokattu: '2025-06-28T10:59:47.597',
        muutosHistoria: muutoshistoria,
        sisalto: _sisalto,
        yhteistutkinto: null,
        tutkinnot: [
          {
            id: '18732268-07ca-4898-a21f-e49b9dd68275',
            hakemusId: '3f140ba6-4018-402c-af32-5e5b802144fc',
            jarjestys: '1',
            nimi: 'Päälikkö',
            oppilaitos: 'Butan Amattikoulu',
            aloitusVuosi: 1999,
            paattymisVuosi: 2000,
            maakoodiUri: 'maatjavaltiot2_762',
            muuTutkintoTieto: null,
            todistuksenPaivamaara: null,
            koulutusalaKoodi: null,
            paaaaineTaiErikoisala: null,
            todistusOtsikko: 'tutkintotodistus',
            muuTutkintoMuistioId: null,
          },
          {
            id: '589038c5-00eb-465b-98bf-3b9ce62bb94d',
            hakemusId: '3f140ba6-4018-402c-af32-5e5b802144fc',
            jarjestys: '2',
            nimi: 'Apu poika',
            oppilaitos: 'Apu koulu',
            aloitusVuosi: 2010,
            paattymisVuosi: 2011,
            maakoodiUri: 'maatjavaltiot2_762',
            muuTutkintoTieto: null,
            todistuksenPaivamaara: null,
            koulutusalaKoodi: null,
            paaaaineTaiErikoisala: null,
            todistusOtsikko: 'muutodistus',
            muuTutkintoMuistioId: null,
          },
          {
            id: '07f503b7-7cf4-4437-b4c6-97512bd44450',
            hakemusId: '3f140ba6-4018-402c-af32-5e5b802144fc',
            jarjestys: 'MUU',
            nimi: null,
            oppilaitos: null,
            aloitusVuosi: null,
            paattymisVuosi: null,
            maakoodiUri: null,
            muuTutkintoTieto: 'En olekaan suorittanutkoulutusta',
            todistuksenPaivamaara: null,
            koulutusalaKoodi: null,
            paaaaineTaiErikoisala: null,
            todistusOtsikko: null,
            muuTutkintoMuistioId: null,
          },
        ],
        asiakirja: {
          allekirjoituksetTarkistettu: false,
          allekirjoituksetTarkistettuLisatiedot: null,
          alkuperaisetAsiakirjatSaatuNahtavaksi: false,
          alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: null,
          selvityksetSaatu: false,
          pyydettavatAsiakirjat: [],
          imiPyynto: {},
          asiakirjamallitTutkinnoista: {
            ece: {
              lahde: 'ece',
              vastaavuus: true,
              kuvaus: 'Jotain kuvausta',
            },
            nuffic: {
              lahde: 'nuffic',
              vastaavuus: false,
            },
            aacrao: {
              lahde: 'aacrao',
              vastaavuus: false,
              kuvaus: 'Jotain muuta kuvausta',
            },
          },
          valmistumisenVahvistus: {
            valmistumisenVahvistus: false,
          },
        },
      }),
    });
  });
};

export const mockLopullisenPaatoksenHakemus = async (page: Page) => {
  let hakemusData = getLopullinenHakemus();
  await page.route(`**/tutu-backend/api/hakemus/*`, async (route) => {
    if (route.request().method() === 'PUT') {
      const putData = route.request().postDataJSON() as Record<string, unknown>;
      hakemusData = { ...hakemusData, ...unwrapData(putData) };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hakemusData),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...hakemusData,
        }),
      });
    }
  });
};

export const mockLiitteet = async (page: Page) => {
  await page.route(
    '**/tutu-backend/api/liite/metadata/**',
    async (route: Route) => {
      const liitteet = getLiitteet();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(liitteet),
      });
    },
  );
};

export const mockKoodistot = async (page: Page) => {
  await page.route(
    '**/tutu-backend/api/koodisto/kansallinenkoulutusluokitus2016koulutusalataso1',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: await readFile(
          path.join(
            __dirname,
            './fixtures/koodistot/kansallinenkoulutusluokitus2016koulutusalataso1.json',
          ),
        ),
      });
    },
  );
  page.route(
    '**/tutu-backend/api/koodisto/maatjavaltiot2',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: await readFile(
          path.join(__dirname, './fixtures/koodistot/maatjavaltiot2.json'),
        ),
      });
    },
  );
  await page.route(
    '**/tutu-backend/api/koodisto/korkeakoulut',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: await readFile(
          path.join(__dirname, './fixtures/koodistot/korkeakoulut.json'),
        ),
      });
    },
  );
};

const unwrapData = (data: Record<string, unknown>): Record<string, unknown> => {
  const unwrapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      key in (value as Record<string, unknown>)
    ) {
      unwrapped[key] = (value as Record<string, unknown>)[key];
    } else {
      unwrapped[key] = value;
    }
  }
  return unwrapped;
};

export const mockPerustelu = async (page: Page) => {
  let perusteluData: Record<string, unknown> = {
    id: 'mock-perustelu-id',
    hakemusId: 'mock-hakemus-id',
    lahdeLahtomaanKansallinenLahde: false,
    lahdeLahtomaanVirallinenVastaus: false,
    lahdeKansainvalinenHakuteosTaiVerkkosivusto: false,
    selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: '',
    selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: '',
    luotu: '2025-09-02T16:08:42.083643',
    luoja: 'Hakemuspalvelu',
    uoRoSisalto: {},
  };

  await page.route('**/tutu-backend/api/perustelu/*', async (route: Route) => {
    if (route.request().method() === 'POST') {
      const postedData = route.request().postDataJSON() as Record<
        string,
        unknown
      >;
      const unwrappedData = unwrapData(postedData);
      perusteluData = { ...perusteluData, ...unwrappedData };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(perusteluData),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(perusteluData),
      });
    }
  });
};

export const mockPaatos = async (page: Page) => {
  let paatosData = getPaatos();
  await page.route(`**/paatos/1.2.246.562.10.00000000001`, async (route) => {
    if (route.request().method() === 'PUT') {
      const putData = route.request().postDataJSON() as Record<string, unknown>;
      paatosData = { ...paatosData, ...unwrapData(putData) };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paatosData),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...paatosData,
        }),
      });
    }
  });
};
