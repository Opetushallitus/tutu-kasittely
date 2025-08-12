import { Route, Page } from '@playwright/test';
import { readFile } from 'fs/promises';
import path from 'path';
import { sortBy } from 'remeda';
import { getLiitteet } from '@/playwright/fixtures/hakemus1';

export const mockAll = async ({ page }: { page: Page }) => {
  mockInit(page);
  mockEsittelijat(page);
  mockHakemusLista(page);
  mockUser(page);
  mockHakemus(page);
};

export const mockBasicForLista = async ({ page }: { page: Page }) => {
  mockInit(page);
};

export const mockSuccessfullLists = async ({ page }: { page: Page }) => {
  mockEsittelijat(page);
  mockHakemusLista(page);
  mockUser(page);
};

export const mockBasicForHakemus = async ({ page }: { page: Page }) => {
  mockInit(page);
  mockEsittelijat(page);
};

export const mockInit = (page: Page) => {
  page.route('**/tutu-backend/api/csrf', async (route: Route) => {
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
  page.route('**/tutu-backend/api/session', async (route: Route) => {
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

export const mockEsittelijat = (page: Page) => {
  page.route('**/tutu-backend/api/esittelijat*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: await readFile(path.join(__dirname, './fixtures/esittelijat.json')),
    });
  });
};

export const mockHakemusLista = (page: Page) => {
  page.route('**/tutu-backend/api/hakemuslista*', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: await readFile(path.join(__dirname, './fixtures/hakemukset.json')),
    });
  });
};

export const mockUser = (page: Page, kieli: string = 'fi') => {
  page.route('**/tutu-backend/api/user', async (route: Route) => {
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

export const mockHakemus = (page: Page) => {
  page.route('**/tutu-backend/api/hakemus/*', async (route: Route) => {
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
        hakija: {
          etunimet: 'Heikki Hemuli',
          kutsumanimi: 'Hessu',
          sukunimi: 'Heittotähti',
          kansalaisuus: {
            fi: 'Suomi',
            sv: 'Finland',
            en: 'Finland',
          },
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
        pyydettavatAsiakirjat: [],
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
      }),
    });
  });
};

export const mockLiitteet = (page: Page) => {
  return page.route(
    '**/tutu-backend/api/liite/metadata**',
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
