import { readFile } from 'fs/promises';
import path from 'path';

import { Route, Page } from '@playwright/test';
import { sortBy } from 'remeda';

import { getLiitteet } from '@/playwright/fixtures/hakemus1';
import { getLopullinenHakemus } from '@/playwright/fixtures/hakemus2';
import { getPaatos } from '@/playwright/fixtures/paatos1';
import { getMockTutkinnot } from '@/playwright/fixtures/tutkinnot';
import { Language } from '@/src/lib/localization/localizationTypes';
import { Hakemus } from '@/src/lib/types/hakemus';
import { Paatosteksti } from '@/src/lib/types/paatosteksti';
import { Tutkinto } from '@/src/lib/types/tutkinto';
import { VahvistettuViestiListItem, Viesti } from '@/src/lib/types/viesti';
import { YhteinenKasittely } from '@/src/lib/types/yhteinenkasittely';

import { _sisalto } from './fixtures/hakemus1/_sisalto';

export const mockAll = async ({ page }: { page: Page }) => {
  await Promise.all([
    mockInit(page),
    mockEsittelijat(page),
    mockHakemusLista(page),
    mockUser(page),
    mockHakemus(page),
    mockPerustelu(page),
    mockPaatos(page),
    mockLiitteet(page),
    mockKoodistot(page),
    mockTutkinnot(page),
    mockFilemakerList(page),
    mockFilemakerHakemus(page),
    mockYhteinenKasittely(page),
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

export const mockFilemakerList = async (page: Page) => {
  await page.route(
    '**/tutu-backend/api/vanha-tutu/lista*',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: await readFile(
          path.join(__dirname, './fixtures/filemakerHakemukset.json'),
        ),
      });
    },
  );
};

export const mockFilemakerHakemus = async (page: Page) => {
  await page.route('**/tutu-backend/api/vanha-tutu/*', async (route: Route) => {
    const url = route.request().url();
    const id = url.split('/').pop()?.split('?')[0];
    const raw = await readFile(
      path.join(__dirname, './fixtures/filemakerHakemukset.json'),
      'utf-8',
    );
    const data = JSON.parse(raw);
    const hakemus = data.items.find((h: { id: string }) => h.id === id);
    await route.fulfill({
      status: hakemus ? 200 : 404,
      contentType: 'application/json',
      body: JSON.stringify(hakemus ?? {}),
    });
  });
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
            'ROLE_APP_TUTU_CRUD',
            'ROLE_APP_TUTU_CRUD_1.2.246.562.10.00000000001',
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
        time: '2025-05-28T10:59:47.597Z',
        modifiedBy: 'Esittelija Testi',
      },
      {
        role: 'Hakija',
        time: '2025-06-15T15:14:47.597Z',
        modifiedBy: 'Hakija Testi',
      },
    ];

    let apHakemus = false;
    if (oid === '1.2.246.562.11.00000000004') {
      // hakemukset.json oleva AP-hakemus
      apHakemus = true;
    }

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
        hakemusKoskee: 1,
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
          yksiloityVTJ: true,
        },
        asiatunnus: 'OPH-111-2025',
        saapumisPvm: '2025-05-14T10:59:47.597Z',
        esittelyPvm: '2025-05-28T10:59:47.597Z',
        paatosPvm: '2025-05-28T10:59:47.597Z',
        esittelijaOid: '1.2.246.562.24.999999999999',
        ataruHakemuksenTila: 'kasittelymaksamatta',
        kasittelyVaihe: 'HakemustaTaydennetty',
        muokattu: '2025-06-28T10:59:47.597Z',
        muokkaaja: 'Muokkaaja Matti',
        ataruHakemustaMuokattu: '2025-07-28T10:59:47.597Z',
        muutosHistoria: muutoshistoria,
        sisalto: _sisalto,
        yhteistutkinto: false,
        onkoPeruutettu: false,
        asiakirja: {
          allekirjoituksetTarkistettu: false,
          allekirjoituksetTarkistettuLisatiedot: null,
          alkuperaisetAsiakirjatSaatuNahtavaksi: false,
          alkuperaisetAsiakirjatSaatuNahtavaksiLisatiedot: null,
          selvityksetSaatu: false,
          pyydettavatAsiakirjat: [],
          imiPyynto: {},
          apHakemus: apHakemus,
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
            valmistumisenVahvistusLisatieto: null,
            valmistumisenVahvistusPyyntoLahetetty: null,
            valmistumisenVahvistusSaatu: null,
            valmistumisenVahvistusVastaus: null,
          },
          suostumusVahvistamiselleSaatu: true,
          esittelijanHuomioita: 'Muistion alkuperäinen sisältö',
        },
        taydennyspyyntoLahetetty: '2025-12-14T10:59:47.597Z',
        liitteidenTilat: [],
        peruutusPvm: null,
      } as Hakemus),
    });
  });
};

export const mockLopullisenPaatoksenHakemus = async (page: Page) => {
  mockGetAndPut(page, `**/tutu-backend/api/hakemus/*`, getLopullinenHakemus());
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

export const unwrapData = (
  data: Record<string, unknown>,
): Record<string, unknown> => {
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
    luotu: '2025-09-02T16:08:42.083Z',
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

export const mockGetAndPut = async (
  page: Page,
  url: string,
  data: Record<string, unknown>,
) => {
  await page.route(url, async (route: Route) => {
    if (route.request().method() === 'PUT') {
      const putData = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...data, ...unwrapData(putData) }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    }
  });
};

export const mockPaatos = async (page: Page) => {
  mockGetAndPut(page, `**/paatos/1.2.246.562.10.00000000001`, getPaatos());
};

export const mockTutkinnot = async (page: Page) => {
  let tutkinnotData = getMockTutkinnot();
  await page.route(
    `**/hakemus/1.2.246.562.10.00000000001/tutkinto/`,
    async (route) => {
      if (route.request().method() === 'PUT') {
        tutkinnotData = route.request().postDataJSON() as Tutkinto[];
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(tutkinnotData),
      });
    },
  );
  await page.route(
    /.\/hakemus\/1.2.246.562.10.00000000001\/tutkinto\/.+/,
    async (route) => {
      if (route.request().method() === 'PUT') {
        const putData = route.request().postDataJSON() as Tutkinto;
        tutkinnotData = tutkinnotData.map((t) => {
          if (t.id === route.request().url().split('/').at(-1)) {
            return putData;
          }
          return t;
        });
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(putData),
        });
      } else if (route.request().method() === 'DELETE') {
        tutkinnotData = tutkinnotData.filter(
          (t) => t.id !== route.request().url().split('/').at(-1),
        );
        await route.fulfill({
          status: 204,
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            tutkinnotData.find(
              (t) => t.id === route.request().url().split('/').at(-1),
            ),
          ),
        });
      }
    },
  );
};

export const mockYhteinenKasittely = async (page: Page) => {
  const yhteinenkasittelydata: YhteinenKasittely[] = [
    {
      id: 'q1',
      vastaanottaja: 'Testi esittelijä',
      vastaanottajaOid: '1.2.246.562.24.999999999999',
      kysymys: 'Voisitko tarkistaa liitteen A tiedot?',
      luotu: '2026-02-04T09:12:00.000Z',
    },
    {
      id: 'q2',
      vastaanottaja: 'Kalle Päätalo',
      vastaanottajaOid: '1.2.246.562.24.999999999998',
      kysymys: 'Onko tämä päätös valmis allekirjoitettavaksi?',
      luotu: '2026-02-03T14:30:00.000Z',
    },
    {
      id: 'q3',
      vastaanottaja: 'Otto Kehittäjä',
      vastaanottajaOid: '1.2.246.562.24.999999999997',
      kysymys: 'Tarvitaanko lisätietoja hakijan opintosuunnasta?',
      luotu: '2026-02-01T08:05:00.000Z',
      jatkoKasittelyt: [
        {
          id: 'q4',
          vastaanottaja: 'Toinen Tyyppi',
          vastaanottajaOid: '1.2.246.562.24.999999999996',
          kysymys: 'Tarvitaanko lisätietoja ???',
          luotu: '2026-02-01T08:05:00.000Z',
        },
        {
          id: 'q5',
          vastaanottaja: 'Vastaaja Esittelijä',
          vastaanottajaOid: '1.2.246.562.24.999999999995',
          kysymys: 'Tarvitaanko lisätietoja ???',
          luotu: '2026-02-01T08:05:00.000Z',
        },
      ],
    },
  ];

  const nextId = (() => {
    let id = 1;
    return () => id++;
  })();

  await page.route(
    '**/tutu-backend/api/hakemus/*/yhteinenkasittely*',
    async (route: Route) => {
      if (route.request().method() === 'POST') {
        const data = route.request().postDataJSON() as YhteinenKasittely;
        yhteinenkasittelydata.push({
          id: `${nextId()}`,
          vastaanottaja: data.vastaanottajaOid,
          vastaanottajaOid: data.vastaanottajaOid,
          kysymys: data.kysymys,
          luotu: new Date().toISOString(),
        });

        await route.fulfill({
          status: 204,
          contentType: 'application/json',
          body: JSON.stringify(yhteinenkasittelydata),
        });
      }
      if (route.request().method() === 'PUT') {
        const data = route.request().postDataJSON() as {
          id: string;
          vastaus?: string;
        };
        const item = yhteinenkasittelydata.find((i) => i.id === data.id);

        if (item) {
          item.vastaus = data.vastaus;
        }

        await route.fulfill({
          status: 204,
          contentType: 'application/json',
          body: JSON.stringify(yhteinenkasittelydata),
        });
      }
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(yhteinenkasittelydata),
        });
      }
    },
  );
};

const defaultPaatosteksti: Paatosteksti = {
  id: 'paatosteksti-id',
  hakemusId: 'hakemus-id',
  luotu: '2025-05-28T10:59:04.597Z',
  luoja: 'Lauri Luoja',
  sisalto:
    '<p><span style="white-space: pre-wrap;">Päätosteksti sisältö</span></p>',
};

export const mockPaatosteksti = (
  page: Page,
  paatosteksti?: Partial<Paatosteksti>,
) => {
  return page.route(
    '**/tutu-backend/api/paatos/1.2.246.562.11.00000000001/paatosteksti**',
    async (route: Route) => {
      if (route.request().method() === 'PUT') {
        const putData = route.request().postDataJSON() as Record<
          string,
          unknown
        >;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(putData),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...defaultPaatosteksti, ...paatosteksti }),
        });
      }
    },
  );
};

export const uusiViesti: Viesti = { kieli: 'en' };
export const viestiTyoversio: Viesti = {
  kieli: 'fi',
  tyyppi: 'ennakkotieto',
  otsikko: 'Työversio',
  viesti: 'Tämä on työversio',
};
export const tallennettuTyoversio: Viesti = {
  ...viestiTyoversio,
  id: '550e8400-e29b-41d4-a716-446655440000',
};

export const mockViestiTyoversio = (page: Page, viesti: Viesti) => {
  let callCounter = 0;
  return page.route(
    '**/tutu-backend/api/viesti/tyoversio/*',
    async (route: Route) => {
      callCounter++;
      const response = callCounter === 1 ? viesti : uusiViesti;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    },
  );
};

export const mockViesti = (page: Page, viesti: Viesti) => {
  return page.route(
    '**/tutu-backend/api/viesti/1.2.246.562.11.**',
    async (route: Route) => {
      if (route.request().method() === 'PUT') {
        const putData = route.request().postDataJSON() as Record<
          string,
          unknown
        >;
        viesti = { ...viesti, ...unwrapData(putData) };
        if (route.request().url().includes('/vahvista')) {
          viesti.vahvistaja = 'viljo vahvistaja';
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(viesti),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(viesti),
        });
      }
    },
  );
};

export const VIESTILISTAN_ENSIMMAINEN_AIKALEIMA = '01.02.2026 14:00';
export const mockViestiLista = (page: Page) => {
  const viestiLista: VahvistettuViestiListItem[] = [
    {
      id: crypto.randomUUID(),
      tyyppi: 'ennakkotieto',
      otsikko: 'Viesti1',
      vahvistettu: '2026-02-01T12:00:00.000Z',
    },
    {
      id: crypto.randomUUID(),
      tyyppi: 'taydennyspyynto',
      otsikko: 'Viesti2',
      vahvistettu: '2026-02-02T12:00:00.000Z',
    },
    {
      id: crypto.randomUUID(),
      tyyppi: 'muu',
      otsikko: 'Viesti3',
      vahvistettu: '2026-02-03T12:00:00.000Z',
    },
  ];
  return page.route(
    '**/tutu-backend/api/viestilista/1.2.246.562.11.00000000001',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(viestiLista),
      });
    },
  );
};

export const mockViestiOletussisalto = (page: Page) => {
  return page.route(
    '**/tutu-backend/api/viesti/oletussisalto/1.2.246.562.11.00000000001/**',
    async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<span style="white-space: pre-wrap;">Oletussisältö</span>',
      });
    },
  );
};
